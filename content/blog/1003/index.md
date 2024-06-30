---
title: Spring Security 없이 JWT 인증/인가 구현 해보기
description: Spring Security를 사용하지 않고 JWT 인증/인가를 구현한 어느 주니어 개발자의 여행기.
tags: [Tech]
date: 2024-02-12
thumbnail: thumbnail.png
---

지금까지 Spring 프로젝트에서 인증/인가를 구현할 때 당연하게 `Spring Security`를 사용하였습니다. 

이번 프로젝트에서는 멀티모듈을 선택하였고 여기서 문제가 발생하였습니다. 저는 실행 가능한 `api` 모듈과, jwt 등 인증, 인가에 필요한 로직을 담고 있는 `security` 모듈을 분리하였습니다. `security`모듈에 모든 인증/인가의 책임이 있다 보니 `Spring Security` 의존성을 `security`모듈만 가지고 이를 사용하는 `api`모듈 에서는 `Spring Security` 의존성을 갖지 않기를 원했습니다. 

하지만 요청 별 권한 설정을 이유로 각 `api`모듈도 필연적으로 `Spring Security`의존성을 가질 수 밖에 없었습니다. 그래서 `api`모듈 들의 불필요한 `Spring Security`의존성을 **제거**하고자 직접 인증/인가를 구현하고자 하였습니다.

<br>

## Spring Security 없이 JWT 인증/인가 구현 해보기


> 본 포스팅은 `Spring Security`를 사용하지 않고 인증/인가를 구현하는 것에 초점을 맞춘 글로, `JWT`에 대한 구현과 설명은 최소화하겠습니다.

<br>

직접 구현한 인증/인가는 다음과 같이 진행됩니다.

1. 유저의 이메일(혹은 id), 권한 정보를 가진 JWT access token 발급
2. `Authorization` 헤더에 토큰이 담긴 API 요청 발생
3. 인증 토큰 해석
4. 요청 내용과 사용자의 권한에 따라 접근 가능 여부 판단
7. 컨트롤러로 요청한 유저의 이메일 제공

<br>

### TokenGenerator

jwt를 이용한 TokenGenerator 입니다.

~~~java
@Component  
@RequiredArgsConstructor  
public class TokenGenerator {  
  
	private static final String CLAIM_NAME_TYPE = "type";  
	private static final String CLAIM_NAME_ROLE = "role";  
  
	private final JwtProperties jwtProperties;  
	private final Key key;  
	private final DateTimePicker dateTimePicker;  
  
	public String generate(TokenType type, TokenClaims claims) {  
		LocalDateTime now = dateTimePicker.now();  
		LocalDateTime expiration = now.plusSeconds(type.getValidityInSeconds(jwtProperties));  
  
	return Jwts.builder()  
		.setSubject(claims.userEmail())  
		.setIssuedAt(DateTimeUtil.toDate(now))  
		.setExpiration(DateTimeUtil.toDate(expiration))  
		.claim(CLAIM_NAME_TYPE, type.name())  
		.claim(CLAIM_NAME_ROLE, claims.role())  
		.signWith(key)  
		.compact();  
	}  
}
~~~

로그인한 사용자의 이메일, 권한 정보, 만료 시간을 담은 토큰을 발급합니다.

<br>

### DecodeTokenFilter

인증 토큰이 담긴 요청이 발생하면 그 토큰을 해석해야 합니다.   

많은 jwt 관련 강의나 블로그에서는 이 과정에서 해석한 인증 정보를 `Security Context Holder`에 저장한 뒤 필요한 곳에서 인증 정보를 불러올 수 있도록 구현되어 있습니다.   

하지만 저는 `Spring Security`를 사용하지 않기 때문에 이 또한 사용할 수 없습니다..  
따라서 다음 필터 혹은 컨트롤러로 인증 정보를 전달하기 위해 `HttpServletRequest`의 `attribute`에 해석한 토큰의 정보를 담아 전달하고 있습니다.

~~~java
@RequiredArgsConstructor  
public class DecodeTokenFilter extends OncePerRequestFilter {  
  
    /* constants */ 
  
    private final TokenDecoder tokenDecoder;  
    private final TokenValidator tokenValidator;  
  
    @Override  
    protected void doFilterInternal(  
            HttpServletRequest request,  
            HttpServletResponse response,  
            FilterChain filterChain  
    ) throws ServletException, IOException {  
  
        decodeToken(request).ifPresent((tokenClaims) -> {  
            request.setAttribute(USER_EMAIL_ATTRIBUTE_KEY, tokenClaims.userEmail());  
            request.setAttribute(USER_ROLE_ATTRIBUTE_KEY, tokenClaims.role());  
        });  
  
        filterChain.doFilter(request, response);  
    }  
  
    private Optional<TokenClaims> decodeToken(HttpServletRequest request) {  
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);  
        if (!hasToken(bearerToken) || !isValidTokenPrefix(bearerToken)) {  
            return Optional.empty();  
        }  
  
        String token = bearerToken.substring(AUTHENTICATION_TOKEN_START_INDEX);  
        tokenValidator.validateToken(token);  
        return Optional.of(tokenDecoder.decode(token));  
    }  
  
    private boolean hasToken(String bearerToken) {  
        return StringUtils.hasText(bearerToken);  
    }  
  
    private boolean isValidTokenPrefix(String bearerToken) {  
        return bearerToken.startsWith(AUTHENTICATION_TOKEN_PREFIX);  
    }  
}
~~~

`decodeToken()` 을 먼저 살펴보면, 헤더에서 토큰을 불러와 토큰이 존재하지 않거나 prefix가 올바르지 않다면 `Optional.empty()`를, 올바른 토큰을 제공하고 있다면 `Optional`에 해석한 토큰의 정보를 담아 반환합니다.

이후 인증 정보가 존재하는 경우에만 `attribute`에 사용자의 이메일과, 권한을 담아 다음 필터로 전달합니다.

<br>

### AuthenticationFilter

`DecodeTokenFilter`를 통해 요청에 대한 인증 정보를 전달받았습니다.  
이제 요청받은 `method`, `uri` 그리고 사용자의 권한을 비교해 접근 가능한 요청인지 확인해야 합니다.

~~~java
@RequiredArgsConstructor  
public class AuthenticationFilter extends OncePerRequestFilter {  
  
    private static final String USER_ROLE_ATTRIBUTE_KEY = "userRole";  
    private static final String EMPTY_ROLE = "ROLE_EMPTY";  
  
    private final AuthorizedRequest authorizedRequest;  
  
    @Override  
    protected void doFilterInternal(  
            HttpServletRequest request,  
            HttpServletResponse response,  
            FilterChain filterChain  
    ) throws ServletException, IOException {  
  
        String method = request.getMethod();  
        String requestUri = request.getRequestURI();  
        String role = readUserRole(request);  
  
        validateUnauthorized(method, requestUri, role);  
        validateForbidden(method, requestUri, role);  
  
        filterChain.doFilter(request, response);  
    }  
  
    private String readUserRole(HttpServletRequest request) {  
        try {  
            return request.getAttribute(USER_ROLE_ATTRIBUTE_KEY).toString();  
        } catch (NullPointerException e) {  
            return EMPTY_ROLE;  
        }  
    }  
  
    private void validateUnauthorized(String method, String requestUri, String role) {  
        if (hasAuthentication(role) && !canAccess(method, requestUri, role)) {  
            throw new ApisSecurityException(HTTP_UNAUTHORIZED);  
        }  
    }  
  
    private void validateForbidden(String method, String requestUri, String role) {  
        if (!hasAuthentication(role) && !canAccess(method, requestUri, role)) {  
            throw new ApisSecurityException(HTTP_FORBIDDEN);  
        }  
    }  
  
    private boolean hasAuthentication(String role) {  
        return role.equals(EMPTY_ROLE);  
    }  
  
    private boolean canAccess(String method, String requestUri, String role) {  
        return authorizedRequest.matches(method, requestUri, role);  
    }  
}
~~~

여기서 주입받은 `AuthorizedRequest`는 `api`모듈 별로 각 요청에 접근 가능한 사용자의 권한들을 등록해 놓은 `Spring Bean`입니다. 이에 대한 내용은 뒤에서 더욱 자세히 다룰 예정이니 여기서는 어떤 역할을 하고 있는지만 대략 알고 넘어가면 좋을 것 같습니다.

먼저 `HttpServletRequest`에서 요청의 `method`, `uri` 그리고 사용자의 권한을 읽어옵니다. 

그리고 읽어온 정보들과 `AuthorizedRequest`에 등록된 내용을 비교해 발생한 요청이 접근 가능한 요청인지 확인합니다.  
접근 가능한 요청이 아니라면 `Unauthorized` 혹은 `Forbidden` 중 적절한 예외를 발생합니다. 

<br>
### AuthorizedRequest

제가 가장 공들인 `AuthorizedRequest`입니다. 
앞서 설명했던 것과 동일하게 모듈 별로 각 요청에 대해 접근 가능한 사용자의 권한들을 작성한 후 `Spring Bean`으로 등록하여 사용합니다.

~~~java
public class AuthorizedRequest {  
  
    private static final MethodAndPattern NOT_REGISTERED = new MethodAndPattern(Set.of(), "NOT_REGISTERED");  
  
    private final AntPathMatcher antPathMatcher;  
    private final Map<MethodAndPattern, Roles> registered;  
    private final boolean isElseRequestPermit;  
  
    protected AuthorizedRequest(  
            Map<MethodAndPattern, Roles> registered,  
            boolean isElseRequestPermit  
    ) {  
        this.antPathMatcher = new AntPathMatcher();  
        this.registered = registered;  
        this.isElseRequestPermit = isElseRequestPermit;  
    }  
  
    public boolean isAccessibleRequest(String method, String requestUri, String role) {  
        MethodAndPattern matched = registered.keySet().stream()  
                .filter(methodAndPattern ->  
                        methodAndPattern.isRegistered(HttpMethod.resolve(method), requestUri, antPathMatcher))  
                .findFirst()  
                .orElse(NOT_REGISTERED);  
  
        if (matched.equals(NOT_REGISTERED)) {  
            return isElseRequestPermit;  
        }  
  
        return registered.get(matched).isAccessibleRole(role);  
    }  
}
~~~
~~~java
public record MethodAndPattern(  
        Set<HttpMethod> methods,  
        String pattern  
) {  
  
    public boolean isRegistered(HttpMethod method, String requestUri, AntPathMatcher antPathMatcher) {  
        return antPathMatcher.match(pattern, requestUri) && methods.contains(method);  
    }  
}
~~~
~~~java
public record Roles(  
        Set<String> roles  
) {  
  
    private static final String ANONYMOUS_ROLE = "ROLE_ANONYMOUS";  
  
    public boolean isAccessibleRole(String enteredRole) {  
        return roles.stream()  
                .anyMatch(role ->  
                        checkPermitAll(role) || checkAuthenticated(role, enteredRole) || hasRole(role, enteredRole));  
    }  
  
    private boolean checkPermitAll(String registeredRole) {  
        return registeredRole.equals(PERMIT_ALL.getPattern());  
    }  
  
    private boolean checkAuthenticated(String registeredRole, String enteredRole) {  
        return registeredRole.equals(AUTHENTICATED.getPattern()) && !enteredRole.equals(ANONYMOUS_ROLE);  
    }  
  
    private boolean hasRole(String registeredRole, String enteredRole) {  
        return registeredRole.equals(enteredRole);  
    }  
}
~~~

uri 등록을 `AntPathStyle`을 사용하기 때문에 `AntMatcher`를 생성합니다.

`MethodAndPattern`은 이름 그대로 `method`와  `uri pattern`을 담고 있는 컬렉션입니다.  
`isRegistered()`를 이용해 요청의 등록 여부를 확인할 수 있습니다.

`Roles`는 요청에 대해 접근 가능한 권한들을 모아둔 일급 컬렉션입니다.   
`isAccessibleRole()`을 이용해 입력된 사용자의 권한이 접근 가능한 권한이지 확인합니다.  

`Map<MethodAndPattern, Roles>`를 통해 이 두 컬렉션을 관리하고 있으며,  
`isElseRequestPermit`에서 등록되지 않은 요청에 대한 허용 여부를 관리하고 있습니다.

`isAccessibleRequest()`에서 등록된 값들을 이용해 해당 요청이 접근 가능한 요청인지를 판단하고 그 결과를 제공하고 있습니다.

`AuthorizedRequest`는 별도의 `AuthorizedRequestBuilder`를 통해 다음과 같이 더욱 선언적으로 생성할 수 있습니다. 빌더에 대한 내용을 다루기엔 내용이 너무 많아 [깃허브 저장소](https://github.com/grida-diary/grida-server/blob/main/grida-apis/apis-security/src/main/java/org/grida/authorizedrequest/AuthorizedRequestBuilder.java)를 참고해 주세요.

~~~java
@Bean  
public AuthorizedRequest authorizedRequest() {  
    return AuthorizedRequestBuilder.withPatterns()  
            .antMatchers(  
                    allHttpMethods(),  
                    uriPatterns("/docs/**"),  
                    permitAll()  
            )  
            .antMatchers(  
                    httpMethods(HttpMethod.POST),  
                    uriPatterns("/api/auth/login", "/api/auth/signup", "/api/auth/signup/email"),  
                    permitAll()  
            )
            .antMatchers(  
                    httpMethods(HttpMethod.GET),  
                    uriPatterns("/api/auth/example"),  
                    hasRoles(ROLE_ADMIN, ROLE_BASIC_USER)  
            )   
            .antMatchers(  
                    httpMethods(HttpMethod.GET),  
                    uriPatterns("/api/auth/role"),  
                    authenticated()  
            )
            .elseRequestAuthenticated();  
}
~~~

<br>

### AuthFilterExceptionHandler

`Filter`에서 발생하는 예외는 `RestControllerAdvice`에서 감지하지 못하기 때문에 발생하는 예외를 핸들링할 필터를 추가로 구현해 주어야 합니다.  

~~~java
public class AuthFilterExceptionHandler extends OncePerRequestFilter {  
  
    @Override  
    protected void doFilterInternal(  
            HttpServletRequest request,  
            HttpServletResponse response,  
            FilterChain filterChain  
    ) throws ServletException, IOException {  
        try {  
            filterChain.doFilter(request, response);  
        } catch (ApisSecurityException exception) {  
            String responseBody = createErrorResponse(exception.getErrorCode()); 
            sendErrorToClient(response, exception.getErrorCode().getHttpStatus(), responseBody);   
        }  
    }  
  
    private String createErrorResponse(ErrorCode errorCode) {  
        ObjectMapper objectMapper = new ObjectMapper();  
  
        try {  
            ApiResponse errorResponse = ApiResponse.error(errorCode, "ApiSecurityException");  
            return objectMapper.writeValueAsString(errorResponse);  
        } catch (IOException e) {  
            throw new RuntimeException(e);  
        }  
    }  
  
    private void sendErrorToClient(HttpServletResponse response, int status, String responseBody) {  
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);  
        response.setCharacterEncoding("UTF-8");  
        response.setStatus(status);  
  
        try {  
            response.getWriter().write(responseBody);  
        } catch (IOException e) {  
            throw new RuntimeException(e);  
        }  
    }  
}
~~~ 

여기서 중요한 점은 `try-catch`를 이용해 예외 발생을 감지하기 때문에 **반드시** `AuthFilterExceptionHandler`의 우선순위가 `DecodeTokenFilter`, `AuthenticationFilter`보다 높아야 합니다.

최종적으로 이 3개의 필터는  
`AuthFilterExceptionHandler` ->`DecodeTokenFilter` -> `AuthenticationFilter.  
의 순서로 우선순위를 가져야만 합니다.

<br>

### ArgumentResolver

세 개의 필터를 거치며 요청에 대한 권한 검증이 모두 완료되었다면 이제 컨트롤러에서 요청한 사용자의 정보를 확인할 수 있어야 합니다.

~~~java
@Target(ElementType.PARAMETER)  
@Retention(RetentionPolicy.RUNTIME)  
@Documented  
public @interface RequestUserEmail {  
}
~~~
~~~java
public class UserEmailResolver implements HandlerMethodArgumentResolver {  
  
	private static final String USER_EMAIL_ATTRIBUTE_KEY = "userEmail";  
  
	@Override  
	public boolean supportsParameter(MethodParameter parameter) {  
		boolean hasAnnotation = parameter.hasParameterAnnotation(RequestUserEmail.class);  
		boolean isStringValue = String.class.isAssignableFrom(parameter.getParameterType());  
  
		return hasAnnotation && isStringValue;  
	}  
  
	@Override  
	public Object resolveArgument(
		MethodParameter parameter,  
		ModelAndViewContainer mavContainer,  
		NativeWebRequest webRequest,  
		WebDataBinderFactory binderFactory
	) throws Exception {  
  
		HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();  
		HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();  
		try {  
			return request.getAttribute(USER_EMAIL_ATTRIBUTE_KEY);  
		} catch (NullPointerException e) {  
			throw new ApisSecurityException(NO_AUTHENTICATED_USER);  
		}
	}  
}
~~~

`@Annotation`과 `ArgunemtResolver`를 이용해 `@RequestBody`,`@RequestParam`과 유사하게 사용자의 이메일을 불러올 수 하였습니다.

`UserEmailResolver`가 `@RequestUserEmail`을 찾아 요청한 사용자의 이메일을 주입해주고 있습니다.

컨트롤러에서는 다음과 같은 방법으로 사용할 수 있습니다.

~~~java
@GetMapping("/example")  
public ApiResponse example(@RequestUserEmail String userEmail) {  
	ExampleResponse response = exampleResponse.execute(userEmail);  
	return ApiResponse.ok(response);  
}
~~~

<br>

### 성능 측정

간단한 성능 측정도 함께 해보았습니다.

<img width="680" alt="테스트 코드" src="https://github.com/wwan13/wwan13.github.io/assets/64270501/8cfe5302-6308-4a97-a91f-ece9218e6b8c">

`Spring Security`에서 사용하는 `SecurityContextHoder`와 제가 사용한 `HttpServletRequest`의 `Attribute`에서 읽기와 쓰기 성능을 테스트하는 간단한 테스트 코드입니다.

<img width="350" alt="테스트 결과" src="https://github.com/wwan13/wwan13.github.io/assets/64270501/1931003d-3e79-426b-b603-d5eeeab73854">

10000회의 단순 읽기와 쓰기 작업만을 기준으로 측정하였을 때 꽤나 유의미한 수치로 `HttpServletRequest`의 `Attribute`가 우세한 성능을 보였습니다. 
`HttpServletRequest`를 초기화하는 과정까지 함께 측정한다면 동일한 조건에서 약 10배 정도의 차이로 `SecurityContextHolder`를 사용한 읽고 쓰기 성능이 우세했습니다. 하지만 요청을 처리하기 위해 `HttpServletRequest`를 생성하는 작업은 필연적으로 발생하기 때문에 결과적으로 `Spring Security`를 사용하는 것보다 성능상 우세하다는 것을 확인할 수 있습니다.

<br>

### 버전 & 의존성

해당 포스팅은 저의 멀티모듈 구성 중 `Security`모듈에 구현되어 있는 내용만을 나타낸 것으로 해당 모듈의 의존성과 버전은 다음과 같습니다.

~~~yml
// java 17
// spring-boot 2.7.13

dependencies {  
    // web  
    implementation 'org.springframework.boot:spring-boot-starter-web'  
  
    // jwt  
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'  
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'  
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'  
  
    // password encoder  
    implementation 'org.springframework.security:spring-security-crypto:6.1.0'  
  
    // module dependencies  
    implementation project(':grida-apis:apis-core')  
}
~~~

>`PasswordEncoder` 역시 `Spring Security`에 포함된 라이브러리라 직접 구현해야 하나 하는 고민도 있었지만, 결국 생산성을 위해 `PasswordEncoder`가 포함된 `spring-security-crypto`라이브러리만 의존하기로 하였습니다.

<br>

## 마치며

처음엔 인증/인가 서버를 분리하고, 별도의 `gateway`를 통해 해결하고자 하였습니다. 하지만 이미 3개의 `api` 모듈과 `mysql`,`nginx`를 하나의 이 인스턴스에 띄워두고 있었기에, 추가 관리 비용이 발생하는 것을 원치 않았습니다. 

처음엔 `Filter`만 잘 이용하면 어렵지 않게 할 수 있을 거라 생각했지만 생각보다 고려해야 할 것이 너무나도 많았고 또 생각보다 구현하는데도 오래 걸렸습니다. 

아직까지 특별한 문제는 느끼지 못하였지만 누군가 다음 프로젝트에 또 이렇게 할 거냐고 묻는다면 흔쾌히 '예'라고 대답하진 못할 것 같습니다.. 

여러분 스프링 라이브러리는 정말 위대합니다..!