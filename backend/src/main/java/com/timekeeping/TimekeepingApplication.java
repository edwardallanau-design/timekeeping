package com.timekeeping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class TimekeepingApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimekeepingApplication.class, args);
    }
}
