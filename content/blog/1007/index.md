---
title: 어노테이션 기반 컨트롤러를 구현하는 방법.
description: dispatcher-sorvlet 개발 이야기
tags: [Tech]
date: 2024-06-20
thumbnail: thumbnail.png
---

학부 4학년 1학기 '네트워크 프로그래밍'의 텀프로젝트로 '소켓 통신을 이용한 자판기 프로그램'을 구현해야만 했습니다.  

함께 한 친구에게 "편하게 비즈니스 로직만 짜게 해줄게!" 라는 약속을 한 뒤, 소켓 메세지를 종류에 따라 처리할 수 있는 일종의 **소켓 통신 프레임워크**를 구현한 이야기를 공유해 드리겠습니다.

> 본 포스팅은 프레임워크 구축을 다루는 포스팅으로, 소켓 통신과 관련한 이야기는 최소화 하겠습니다.

<br/>

## 첫 번째 방법
~~~java
@RequiredArgsConstructor
public abstract class BaseUseCase<T> {

    private final ObjectMapper objectMapper;

    public SocketResponse execute(Object data) {
        return core(casting(data));
    }

    private T casting(Object data) {
        return objectMapper.convertValue(data, support());
    }

    abstract public SocketResponse core(T data);

    abstract public Class<T> support();
}
~~~
~~~java
@Getter
@RequiredArgsConstructor
public enum ProductRequestType implements RequestType {

    ADD_ITEM("PRODUCT_ADD_ITEM","addItemUseCase"),
    PURCHASE_ITEM("PRODUCT_PURCHASE_ITEM","purchaseItemUseCase");

    private final String name;
    private final String useCaseName;
}
~~~

처음 시도한 방법은 위와 같았습니다.

소켓 메세지로 전달된 데이터를 처리하는 추상 클래스 `BaseUseCase`를 구현한 뒤, 각 UseCase들은 이 BaseUseCase를 상속받아 추상 메소드인 `core()`만 구현하면 되었습니다.  

이 UseCase들은 enum타입의 RequestType에 등록하여 적절한 UseCase를 찾아 이를 호출하는 것으로 소켓 메세지를 처리하였습니다.

크게 불편하진 않았지만, 스프링 개발자인 친구에게 더욱 익숙한 방법으로 제공하고자 새로운 방법을 찾아 나섰습니다.

<br/>

## 어노테이션 기반 컨트롤러

~~~java
@RestController
@RequestMapping("/api")
public class HomeController {
    
    @GetMapping("/home")
    public String home() {
        ...
        return "home";
    }
}
~~~

흔히 http 요청을 처리할때 사용하는 컨트롤러의 모습입니다.  

소켓 메세지 핸들러가 이러한 모습으로 메세지를 처리한다면 동료 개발자가 더욱 익숙한 환경에서 비즈니스 로직에 더욱 집중할 수 있을 것입니다.

<br/>

### 규칙

이러한 컨트롤러의 형태를 갖추기 위해 사전에 다음과 같은 규칙들을 정의하였습니다.

- 각 요청은 `key`로 구분하며 각 요청 키는 `EXAMPLE_KEY`와 같이 대문자와 `_`를 섞어 사용한다.
- 요청 키 에는 `EXAMPLE_KEY_{id}`와 같이 변수를 포함할 수 있다.
- 요청에 필요한 데이터는 `body`에 담아 전달한다.
- 전체 요청은 다음과 같은 json 형식의 문자열로 전달되며, 응답 또한 같은 형태로 전달된다.
    ```json
    {
        "key" : "EXAMPLE_KEY",
        "body" : {
            "name" : "kim"
        }
    }
    ```

<br/>

이 규칙 따르는 다음과 같은 모습의 컨트롤러를 만들고자 합니다.
~~~java
@SocketController
@RequestMapping(ket = "ITEM")
public class ItemController {
    ...

    @RequestMapping(key = "MODIFY_{itemId}")
    public SocketResponse modifyItem(
            @RequestBody ModifyItemRequest request,
            @KeyParameter Long itemId
    ) {
        ModifyItemResponse response = new ModifyItemResponse("item");
        return SocketResponse.success(response);
    }
}
~~~
spring에서 제공하는 컨트롤러와 매우 유사한 모습을 기대할 수 있습니다.

<br/>

## Dispatcher Sorvlet

위와 같은 구현을 위한 시나리오는 다음과 같습니다.

1. 프로젝트 실행(컨텍스트 로트)시 `@SocketController` **스캔 후 핸들러 등록**
2. 소켓 요청 발생 시 요청과 일치하는 **핸들러 매핑**
3. 핸들러가 필요로 하는 **인자 파악 및 제공**
4. **요청 처리**
5. 응답 전송

이러한 과정들이 Dispatcher Servlet이 http 요청을 처리하는 방법과 유사하여 이 프레임워크의 이름을 `Dispatcher So(cket)rvlet`으로 짓게 되었습니다.

<br/>

### 컴포넌트 스캔

선언한 컨트롤러를 등록하는 별도의 과정을 거치지 않기 때문에, 프로젝트 실행(컨텍스트 로트)과 동시에 핸들러들을 찾아 등록해주는 과정이 필요하였습니다.

하지만 여기엔 몇 가지 조건과 이에 따르는 문제점이 있었습니다.

여기엔 한가지 중요한 조건이 있었습니다.
> 리플렉션을 이용해 메소드를 실행(`Method.invoke()`) 하기 위해선 인스턴스화 된 컨트롤러를 보유하고 있어야 한다.

`Class.newInstance()`를 이용하면 충족할 수 있는 간단한 조건이라 생각하였지만, 이로 인해 발생하는 여러가지 문제점과 마주하였습니다.

1. 각 컨트롤러들은 서로 다른 서비스 컴포넌트를 의존하고 있으며, 서비스들 또한 서로 다른 레포지토리를 의존한다.
2. 하나의 컨트롤러를 인스턴스화 하기 위해선 계층적으로 의존 관계에 엮여 있는 모든 컴포넌트를 인스턴스화 해야 한다.
3. 스프링이 모든 컴포넌트를 싱클톤으로 관리하려는 싱글톤 패턴에 어긋난다.

모두 스프링이 개발자의 편의를 위해 제공하는 IoC, DI 등의 편의성 기능으로 인해 발생하는 문제였습니다.
처음엔 스프링으로 인해 발생한 문제이다보니, 자바 코드 만으로 위 문제를 해결하고자 하였으나, 어떤 방법으로도 3번의 문제점을 피해갈 수 없었습니다.

<br/>

하지만 역으로 스프링의 도움을 받아보기로 하였습니다.  

`@SocketController`에 `@Component`를 추가해 컨트롤러를 컴포넌트로 등록하고, 리플렉션으로 획득한 **클래스 이름을 이용해 `ApplicationContext`에서 불러오는** 방법을 이용해 생각보다 간단히 해결할 수 있었습니다.

~~~java
public class DefaultRequestHandlerScanner implements RequestHandlerScanner {

    private final ComponentScanner componentScanner;
    private final ApplicationContext applicationContext;

    public DefaultRequestHandlerScanner(
            ComponentScanner componentScanner,
            ApplicationContext applicationContext
    ) {
        this.componentScanner = componentScanner;
        this.applicationContext = applicationContext;
    }

    @Override
    public RequestHandlers scan() {
        Set<Class<?>> controllerClasses = componentScanner
                .scanComponentsWithAnnotation(SocketController.class);
        Set<RequestHandler> handlers = extractAllHandlers(controllerClasses);

        return new RequestHandlers(handlers);
    }

    private Set<RequestHandler> extractAllHandlers(
            Set<Class<?>> controllerClasses
    ) {
        Set<RequestHandler> handlers = new HashSet<>();

        for (Class<?> controller : controllerClasses) {
            Object registeredController = applicationContext
                    .getBean(NamingConverter.toLowerCamelCase(controller.getSimpleName()));
            extractHandlers(registeredController, handlers);
        }

        return handlers;
    }

    private void extractHandlers(
            Object controller,
            Set<RequestHandler> handlers
    ) {
        Arrays.stream(controller.getClass().getDeclaredMethods())
                .filter(this::isHandlerMethod)
                .forEach(method -> {
                    RequestHandler handler = RequestHandler.of(controller, method);
                    handlers.add(handler);
                });
    }

    private boolean isHandlerMethod(Method method) {
        return method.isAnnotationPresent(RequestMapping.class);
    }
}
~~~
[ComponentScanner 코드 보러 가기](https://github.com/JaPangi/dispatcher-sorvlet/blob/main/src/main/java/io/wwan13/dispatchersorvlet/sorvlet/processor/ReflectionComponentScanner.java)  
[RequstHandler 코드 보러 가기](https://github.com/JaPangi/dispatcher-sorvlet/blob/main/src/main/java/io/wwan13/dispatchersorvlet/sorvlet/RequestHandler.java)

이렇게 모든 핸들러들을 찾아 RequestHandlers에 등록할 수 있게 되었습니다.

<br/>

### 핸들러 매핑

각각의 핸들러가 고유한 '요청 키'를 보유하고 있으며, 모든 핸들러가 RequestHandlers에 의해 관리되고 있기 빼문에 어렵지 않게 구현할 수 있었습니다.

~~~java
public record RequestHandlers(
        Set<RequestHandler> handlers
) {

    private static final RequestKeyMatcher requestKeyMatcher = new RequestKeyMatcher();

    public RequestHandler handlerMapping(String requestKey) {
        return handlers.stream()
                .filter(handler -> requestKeyMatcher.matches(handler.requestKey(), requestKey))
                .findAny()
                .orElseThrow(() -> new HandlerNotFoundException(requestKey));
    }
}
~~~
[RequestKeyMatcher 코드 보러 가기](https://github.com/JaPangi/dispatcher-sorvlet/blob/main/src/main/java/io/wwan13/dispatchersorvlet/sorvlet/support/RequestKeyMatcher.java)

<br/>

### 핸들러가 필요로 하는 인자 파악 및 제공

이제 핸들러가 필요로 하는 데이터를 인자로 넘겨줘야 합니다.  

각 핸들러는 필요로 하는 정보의 종류도 다르고, 그 갯수도 다르기 때문에 `@KeyParameter`와 `@RequestBody`라는 어노테이션을 정의해 제공해야 하는 데이터의 종류를 구분하고, `ArgumentResolver`가 이를 해석하여 핸들러가 필요로 하는 정보를 인자로 제공합니다.

~~~java
public class DefaultArgumentsResolver implements ArgumentsResolver {

    private static final String KEY_PARAMETER_DELIMITER = "_";
    private static final String KEY_PARAMETER_FORMAT = "{%s}";

    public Object[] resolve(RequestHandler handler, SocketRequest request) {
        Parameter[] parameters = handler.getHandlerParameters();
        int parametersLength = parameters.length;
        Object[] arguments = new Object[parametersLength];

        for (int i = 0; i < parametersLength; i++) {
            Parameter parameter = parameters[i];
            arguments[i] = resolveArgument(parameter, request, handler);
        }

        return arguments;
    }

    private Object resolveArgument(
            Parameter parameter,
            SocketRequest request,
            RequestHandler handler
    ) {
        if (parameter.isAnnotationPresent(RequestBody.class)) {
            return resolveRequestBody(request.body(), parameter);
        }

        if (parameter.isAnnotationPresent(KeyParameter.class)) {
            return resolveKeyParameter(handler.requestKey(), request.key(), parameter);
        }

        throw new ResolveArgumentException();
    }

    private Object resolveRequestBody(Object requestBody, Parameter parameter) {
        return TypeConverter.convert(requestBody, parameter.getType());
    }

    private Object resolveKeyParameter(
            String registeredKey,
            String requestKey,
            Parameter parameter
    ) {
        String keyParameter = String.format(KEY_PARAMETER_FORMAT, parameter.getName());
        int keyParameterIndex =
                List.of(registeredKey.split(KEY_PARAMETER_DELIMITER)).indexOf(keyParameter);

        String givenValue = requestKey.split(KEY_PARAMETER_DELIMITER)[keyParameterIndex];

        return TypeConverter.convert(givenValue, parameter.getType());
    }
}
~~~

<br/>

### 요청 처리

이제 요청을 처리할 수 있는 모든 준비가 완료되었습니다.

~~~java
public class DispatcherSorvlet {

    private static final Logger log = LoggerFactory.getLogger(DispatcherSorvlet.class);

    private final RequestHandlers requestHandlers;
    private final ArgumentsResolver argumentsResolver;
    private final ExceptionHandlers exceptionHandlers;

    public DispatcherSorvlet(
            RequestHandlers requestHandlers,
            ArgumentsResolver argumentsResolver,
            ExceptionHandlers exceptionHandlers
    ) {
        this.requestHandlers = requestHandlers;
        this.argumentsResolver = argumentsResolver;
        this.exceptionHandlers = exceptionHandlers;
    }

    public String doService(String socketMessage) {
        try {
            SocketRequest request = SocketMessageSerializer.deserialize(socketMessage);

            RequestHandler handler = requestHandlers.handlerMapping(request.key());

            Object[] arguments = argumentsResolver.resolve(handler, request);
            Object response = handler.handle(arguments);

            return SocketMessageSerializer.serialize(response);
        } catch (Exception e) {
            Exception rootException = getRootException(e);

            ExceptionHandler exceptionHandler = exceptionHandlers.handlerMapping(rootException);
            Object response = exceptionHandler.handle(rootException);

            log.error("[{}] Exception raised ({})",
                    MDC.get("client_id"), rootException.getMessage());

            return SocketMessageSerializer.serialize(response);
        }
    }

    private Exception getRootException(Exception exception) {
        if (exception instanceof InvocationTargetException) {
            return (Exception) exception.getCause();
        }
        return exception;
    }
}
~~~

요청은 `DispatcherSorvlet`의 `doService()`에서 처리되며

1. 요청 역직렬화
2. 핸들러 매핑
3. 인자 파악 및 제공
4. 핸들러 실행
5. 반환값 직렬화
6. 클라이언트에게 응답 제공

의 순서로 요청을 처리합니다.

> 예외 처리 및 전체 코드는 [깃허브 저장소](https://github.com/JaPangi/dispatcher-sorvlet)를 참고해 주세요.

<br/>

## 마치며

이제 위에서 계획한 예제와 같이 어노테이션 선언만으로 소켓 요청을 처리할 수 있게 되었습니다.  

또한 스프링이 제공하는 @Controller와 유사한 모습으로 동료 개발자에게 보다 편한 개발 경험을 제공할 수 있었습니다.
