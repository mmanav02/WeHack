package com.we.hack.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping
    public String handleGet(){
        return "GET test working!";
    }

    @PostMapping
    public String handlePost(@RequestBody String body){
        return "POST test working! You sent: " + body;
    }
}
