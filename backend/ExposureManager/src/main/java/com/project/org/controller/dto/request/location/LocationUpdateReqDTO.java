package com.project.org.controller.dto.request.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocationUpdateReqDTO {
    @NotNull
    private Long id;
    @NotBlank
    private String name;
    @NotBlank
    private String address;
    @NotBlank
    private String country;
    @NotBlank
    private String city;
    @NotBlank
    private Integer zipCode;
    @NotNull
    private Long accountId;
}
