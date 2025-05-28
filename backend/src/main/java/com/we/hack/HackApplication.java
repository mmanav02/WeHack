package com.we.hack;

import com.we.hack.service.logger.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;

@SpringBootApplication
public class HackApplication {

	public static void main(String[] args) throws IOException {
		SpringApplication.run(HackApplication.class, args);
	}

}