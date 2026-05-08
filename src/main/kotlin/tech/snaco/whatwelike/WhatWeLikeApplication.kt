package tech.snaco.whatwelike

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class WhatWeLikeApplication

fun main(args: Array<String>) {
	runApplication<WhatWeLikeApplication>(*args)
}
