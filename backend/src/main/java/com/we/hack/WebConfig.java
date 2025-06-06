package com.we.hack;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5174")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
            
            @Override
            public void addViewControllers(ViewControllerRegistry registry) {
                // Forward ALL React routes to index.html so React Router can handle them
                
                // Main routes
                registry.addViewController("/").setViewName("forward:/index.html");
                registry.addViewController("/about").setViewName("forward:/index.html");
                registry.addViewController("/login").setViewName("forward:/index.html");
                registry.addViewController("/register").setViewName("forward:/index.html");
                registry.addViewController("/hackathons").setViewName("forward:/index.html");
                registry.addViewController("/create-hackathon").setViewName("forward:/index.html");
                registry.addViewController("/submissions").setViewName("forward:/index.html");
                registry.addViewController("/test-connection").setViewName("forward:/index.html");
                
                // Hackathon-specific routes with parameters
                registry.addViewController("/hackathons/**").setViewName("forward:/index.html");
                
                // Submission-specific routes with parameters
                registry.addViewController("/submissions/**").setViewName("forward:/index.html");
                
                // Additional common React routes that might exist
                registry.addViewController("/dashboard").setViewName("forward:/index.html");
                registry.addViewController("/profile").setViewName("forward:/index.html");
                registry.addViewController("/leaderboard").setViewName("forward:/index.html");
                
                // Catch remaining single-level routes
                registry.addViewController("/{path:[^.]*}").setViewName("forward:/index.html");
            }
        };
    }
}