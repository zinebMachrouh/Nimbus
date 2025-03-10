package com.nimbus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {
  
  @Bean(name = "taskExecutor")
  public Executor taskExecutor() {
      ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
      executor.setCorePoolSize(10);
      executor.setMaxPoolSize(20);
      executor.setQueueCapacity(100);
      executor.setThreadNamePrefix("NimbusAsync-");
      executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
      executor.initialize();
      return executor;
  }
  
  @Bean(name = "locationExecutor")
  public Executor locationExecutor() {
      ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
      executor.setCorePoolSize(5);
      executor.setMaxPoolSize(10);
      executor.setQueueCapacity(50);
      executor.setThreadNamePrefix("LocationAsync-");
      executor.initialize();
      return executor;
  }
  
  @Bean(name = "notificationExecutor")
  public Executor notificationExecutor() {
      ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
      executor.setCorePoolSize(5);
      executor.setMaxPoolSize(10);
      executor.setQueueCapacity(100);
      executor.setThreadNamePrefix("NotificationAsync-");
      executor.initialize();
      return executor;
  }
}

