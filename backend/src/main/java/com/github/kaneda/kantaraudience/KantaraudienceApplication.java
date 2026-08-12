package com.github.kaneda.kantaraudience;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class KantaraudienceApplication {

	public static void main(String[] args) {
		SpringApplication.run(KantaraudienceApplication.class, args);
	}

}
