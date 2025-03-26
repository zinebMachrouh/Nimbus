package com.example.backend.service.impl;

import com.example.backend.dto.mapbox.MapboxResponseDTO;
import com.example.backend.service.MapboxService;
import com.example.backend.utils.records.Coordinates;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MapboxServiceImpl implements MapboxService {

    @Value("${mapbox.url}")
    private String url;

    @Value("${mapbox.access-token}")
    private String accessToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public MapboxResponseDTO getDirections(List<Coordinates> coordinates) {

        String coordinatesString = coordinates.stream()
                .map(c -> String.join(",", Double.toString(c.lng()), Double.toString(c.lat())))
                .collect(Collectors.joining(";"));

        String uri = UriComponentsBuilder.fromUriString(url)
                .pathSegment(coordinatesString)
                .queryParam("alternatives", false)
                .queryParam("geometries", "geojson")
                .queryParam("language", "en")
                .queryParam("overview", "full")
                .queryParam("steps", false)
                .queryParam("access_token", accessToken)
                .toUriString();

        log.info("Sending request to Mapbox API: {}", uri);

        return restTemplate.getForObject(uri, MapboxResponseDTO.class);
    }
}