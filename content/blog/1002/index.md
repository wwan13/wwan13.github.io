---
title: 내가 원하는 예외가 아닌 HttpMessageNotReadableException만잡는다구요?
description: 요청시 들어오는 dto의 생성자에서 던지는 커스텀 예외를 잡지 못하는 이유를 알아보자.
tags: [Tech]
date: 2024-02-10
thumbnail: thumbnail.png
---

레코드를 DTO로 사용하며 컴팩트 생성자를 이용해 요청 값에 대한 검증을 하려고 하였습니다.

~~~java
public record LoginRequest(  
		String email,  
		String password  
) {  
  
	public LoginRequest {  
		required("email", email);  
		required("password", password);  
	}  
}
~~~

~~~java
public static void required(String fieldName, String value) {  
	if (!StringUtils.hasText(value)) {  
		throw new RequestFieldException(MUST_BE_REQUIRED, fieldName);  
	}  
}
~~~

레코드의 컴팩트 생성자는 생성자 안에 있는 코드를 초기화 전에 호출해 줍니다. 그렇기 때문에 당연히 초기화 전에 예외가 발생하면 `@RestControllerAdvice`와 `@ExceptionHandler`에서 예외가 핸들링 되어 다음과 같은 응답이 오는 것을 예상하였습니다.

~~~json
{
	"timeStamp": "2024-02-23 23:02:00",
	"status": "ERROR",
	"message": "email 필드는 값이 없을 수 없습니다.",
	"cause": "RequestFieldException",
	"errorCode": "MUST_BE_REQUIRED"
}
~~~

하지만 정작 제가 받은 응답은 아래의 응답 입니다.

![wrong response](https://github.com/wwan13/wwan13.github.io/assets/64270501/c657b847-4293-4528-a31d-b06b2cb14412)

`required()`에서 던진 `RequestFieldException`이 아닌 `DispatcherServlet`이 던지는 `HttpMessageNotReadableException` 이 응답으로 오는 것입니다.

<br>

### 뭐가 문제일까?

원인은 `Jackson`이 `Json`을 `Java` 문법으로 역직렬화 하는 과정에 있었습니다.

![jackson StdValueInstantiator](https://github.com/wwan13/wwan13.github.io/assets/64270501/04f58ade-0f65-481c-8a3a-2c30b354b079)

위 코드는 `DispatcherServlet`이 `Json`을 역직렬화 할 때 사용하는 `Jackson`라이브러리의 `StdValueInstantiator`입니다.

코드에서 볼 수 있듯 `Object`를 생성하는 `_withArgsCreator.call(args)`에서 발생하는 모든 예외를 잡아 예외를 던지고 있습니다. 이때 `DispatcherServlet`은 이 예외를 `HttpMessageNotReadableException`으로 던지고 있었던 것입니다. 그래서 `@RestControllerAdvice`에서도 제가 의도한`RequestFieldException`가 아닌 `HttpMessageNotReadableException`를 잡아 클라이언트로 응답을 해 줬던 것이죠.

<br>

더 정확한 확인을 위해 생성자에 브레이크 포인트를 걸어 디버깅을 해보면

![debug break point](https://github.com/wwan13/wwan13.github.io/assets/64270501/4392262a-ec57-4d2d-afa8-4c6559c4a849)

![debugging result](https://github.com/wwan13/wwan13.github.io/assets/64270501/0c3907af-945b-4fa2-822f-6a08e7af7e88)

`_withArgsCreator.call(args)` 에서 예외가 발생해 catch 문으로 넘어가는 것을 볼 수 있었습니다.

<br>

### 어떻게 해결하지?

원래 `HttpMessageNotReadableException`를 처리하던 `exceptionHandler`입니다.

```java
@ExceptionHandler(HttpMessageNotReadableException.class)  
private ResponseEntity<ApiResponse> handleHttpMessageNotReadableException(  
HttpMessageNotReadableException e) {  
	ErrorCode errorCode = INVALID_HTTP_REQUEST;  
  
	return ResponseEntity.status(errorCode.getHttpStatus())  
		.body(ApiResponse.error(getCause(e), errorCode.name(), errorCode.getMessage()));  
}
```

예외를 감지하면 그에 대응하는 적절한 응답을 주는 단순한 방법 이였습니다.

<br>

그리고 제가 이 문제를 해결한 코드입니다.

```java
@ExceptionHandler(HttpMessageNotReadableException.class)  
private ResponseEntity<ApiResponse> handleHttpMessageNotReadableException(  
HttpMessageNotReadableException e) {  
  
	if (e.getRootCause() instanceof RequestFieldException requestFieldException) {  
		ErrorCode requestFieltErrorCode = requestFieldException.getErrorCode();  
  
		return ResponseEntity.status(requestFieltErrorCode.getHttpStatus())  
			.body(ApiResponse.error(  
				getCause(requestFieldException),  
				requestFieltErrorCode.name(),  
				requestFieldException.getErrorMessage()  
			));  
	}  
  
	ErrorCode errorCode = INVALID_HTTP_REQUEST;  
  
	return ResponseEntity.status(errorCode.getHttpStatus())  
		.body(ApiResponse.error(getCause(e), errorCode.name(), errorCode.getMessage()));  
}
```

`e.getRootCause()`를 이용해 예외가 발생한 원인을 불러왔습니다.  
`HttpMessageNotReadableException`은 이 경우를 제외하고도 자주 발생할 수 있는 예외이기 때문에 `rootCause`가 `RequestFieldException`인 경우에 한해서만 별도의 응답을 제공하도록 하였습니다.  

그 결과 이제 제가 예상하던 응답을 확인할 수 있게 되었습니다!!

![final response](https://github.com/wwan13/wwan13.github.io/assets/64270501/7af3a1d3-db81-4392-8ef5-f6bf297cb6d2)

<br>

한 가지 아쉬운 점은

~~~java
public LoginRequest {  
	required("email", email);  
	required("password", password);  
}  
~~~

`{필드명} 필드는 값이 없을 수 없습니다` 와 같은 응답을 전달하기 위해 위 코드 처럼 필드 명을 함께 전달해야 해서 약간은 불편한 느낌이 없지 않아 있어 이 부분을 더 '깔꼼!'하게 해결할 수 있도록 해보겠습니다.