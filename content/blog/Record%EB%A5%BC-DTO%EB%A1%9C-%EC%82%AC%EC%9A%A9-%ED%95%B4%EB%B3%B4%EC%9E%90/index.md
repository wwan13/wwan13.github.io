---
title: Record를 DTO로 사용해 보자
description: Java의 Record를 이용하여 DTO를 보다 Immutable하게 관리 하는 법을 알아보자.
tags: [Tech]
date: 2024-01-27
---

객체를 `Immutable` 하게 생성 하는 것으로 많은 장점을 가지게 됩니다.

한 번 생성 된 불변 객체는 그 값이 변하지 않기 때문에 우리는 이 객체에 더욱 신뢰할 수 있습니다. 또 멀티 쓰레드 환경에서 동기화 처리 없이 객체를 공유할 수 있다는 것도 하나의 장점입니다.

그리고 저는 `DTO`, `VO`는 더더욱 불변으로 관리해야 한다고 생각하였습니다. 계층간 전달해야 할 값이 setter에 의해 변경 된다거나, properties와 같이 환경 변수 등의 변해선 안되는 값이 setter에 의해 언제든 변경될 수 있다면 그 값에 대한 신뢰가 떨어지기 마련입니다.

하지만, 일반적인 상황에서 Spring의 모든 DTO를 Immutable 하게 관리 하기엔 꽤 많은 비용이 소모됩니다.

<br>
<br>

## Immutable 한 DTO


저는 Immutable 한 DTO를 만들기 위해 다음과 같은 코드를 작성하기로 하였습니다.

~~~java
@Getter
@RequireArgsConstructor
class MemberDto {
	private final String name;
	private final int age;
}
~~~

이 DTO를 직렬화 즉 ResponseBody에 담아서 응답으로 보내주는 것에는 큰 문제 없습니다.

하지만 이 DTO를 RequestBody로 받는 API에서는 다음과 같은 문제가 발생하게 됩니다.

![실패 요청 결과](https://github.com/wwan13/wwan13.github.io/assets/64270501/cb6edc01-bce4-4a58-9c7b-e0d8e23a1ddf)

그 원인은 `ObjectMapper`의 역직렬화 방법에 있습니다.

ObjectMapper는 다음과 같은 방법으로 JSON 역직렬화를 수행합니다.
1. `BeanDeserializer.deserializeFromObject()` 에서 기본 생성자를 이용한 리플렉션으로 DTO 객체를 생성합니다.
2. `FieldProperty.deserializeAndSet(...)` 에서 리플렉선으로 얻어온 Filed에 JSON에서 얻은 값을 set 합니다. 

여기서 문제는 2번의 set입니다. 우리는 DTO의 모든 필드를 final로 선언하였기 때문에 set 과정을 수행할 수 없는 것입니다.

<br>

그래서 저는 일반적으로 다음과 같은 DTO를 작성하곤 했습니다.

~~~java
@Getter
@NoArgsConstructor
public class MemberDto {
	private String name;
	private int age;
}
~~~

필드를 final로 선언하지 않고, 기본 생성자와 getter를 가지고 있는 모습 입니다.

이렇게 선언하면 다음과 같이 성공적으로 API를 호출 할 수 있게 됩니다.

![성공 요청 결과](https://github.com/wwan13/wwan13.github.io/assets/64270501/1b4a1473-5075-4f93-8ec1-4e255e6ce5e9)

<br>

하지만 저의 관심사는 성공하는 DTO를 만드는게 아니라, Immutable한 DTO를 만드는 것입니다.
이 것을 `@JsonProperty`와 `@JsonCreator` 라는 어노테이션을 통해 다음과 같이 해결할 수 있습니다.

~~~java
@Getter
public class MemberDto {
	
	@JsonPropertiey("name")
	private final String name;
	
	@JsonPropertiey("age")
	private final int age;

	@JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
	public MemberDto(
		@JsonPropertiey("name") String name,
		@JsonPropertiey("age") int age
	) {
		this.name = name;
		this.age = age;
	}
}
~~~

우리는 이렇게 Immutable한 DTO를 얻을 수 있게 되었습니다.
하지만 추가로 작성해야 하는 어노테이션이 너무 많습니다. API 가 요청하는 필드가 많아지면 많아질 수록 더 많은 어노테이션을 작성해야 합니다.

<br>
<br>

## Record를 이용해 Immutable한 DTO 만들기

`Record`는 Java 14 에서 추가된 클래스로 **필드 유형과 이름만 필요한 불변 데이터 클래스** 입니다.
(Record에 대한 자세한 셜명은 [baeldung](https://www.baeldung.com/java-record-keyword)에 잘 정리가 되어 있으니 이 글을 참고시면 됩니다.)

Record를 이용하면 위 예시를 다음과 같이 간단하게 선언할 수 있습니다.

~~~java
public record MemberDto(
		String name, 
		int age
) {
}
~~~

또한 특별한 어노테이션 없이 ObjectMapper를 통한 직렬화, 역직렬화를 수행할 수 있습니다.

![record test](https://github.com/wwan13/wwan13.github.io/assets/64270501/bd74c519-2bf6-40c6-80dc-259d897b84e3)

![record test 결과](https://github.com/wwan13/wwan13.github.io/assets/64270501/3fac391a-efa9-41d2-94be-f6d859499645)

테스트를 통해 확인해 보면 문제 없이 역직렬화를 수행하는 것을 볼 수 있습니다.

![성공 요청 결과](https://github.com/wwan13/wwan13.github.io/assets/64270501/1b4a1473-5075-4f93-8ec1-4e255e6ce5e9)

당연하게 API도 문제 없이 호출 됩니다.

<br>

## 마치며

이렇게 `Record`를 이용해 `DTO`를 조금 더 쉽게 `Immutable`한 상태로 관리할 수 있게 되었습니다.

Record는 기존의 class DTO와 달리 getter나 기본 생성자 등을 추가로 구현하지 않아도 DTO로서의  동작을 수행 하기 때문에 개발자의 실수를 줄일 수 있다는 장점도 존재 합니다.
(실제로 실수로 기본 생성자를 빼먹어 삽질을 한 경우가 수 없이 존재한다..)

`Lazy Loading`의 동작 방법 때문에 Record가 `Entity`로는 사용하지 못하지만, DTO 혹은 VO로 사용 하기엔 적합한 클래스 인 것 같아 앞으로도 유용하게 사용할 것 같습니다.