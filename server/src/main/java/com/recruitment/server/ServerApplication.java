package com.recruitment.server;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {

		Dotenv dotenv = Dotenv.configure().load();

		System.setProperty("DB_URL", dotenv.get("DB_URL"));
		System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
		System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
		System.setProperty("JWT_EXPIRATION", dotenv.get("JWT_EXPIRATION"));
		System.setProperty("JWT_REFRESH_EXPIRATION", dotenv.get("JWT_REFRESH_EXPIRATION"));

		// Cloudinary and Gemini configuration (optional)
		if (dotenv.get("CLOUDINARY_CLOUD_NAME") != null)
			System.setProperty("CLOUDINARY_CLOUD_NAME", dotenv.get("CLOUDINARY_CLOUD_NAME"));
		if (dotenv.get("CLOUDINARY_API_KEY") != null)
			System.setProperty("CLOUDINARY_API_KEY", dotenv.get("CLOUDINARY_API_KEY"));
		if (dotenv.get("CLOUDINARY_API_SECRET") != null)
			System.setProperty("CLOUDINARY_API_SECRET", dotenv.get("CLOUDINARY_API_SECRET"));

		if (dotenv.get("GEMINI_API_URL") != null)
			System.setProperty("GEMINI_API_URL", dotenv.get("GEMINI_API_URL"));
		if (dotenv.get("GEMINI_API_KEY") != null)
			System.setProperty("GEMINI_API_KEY", dotenv.get("GEMINI_API_KEY"));

		SpringApplication.run(ServerApplication.class, args);
	}

}
