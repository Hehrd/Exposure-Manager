package com.project.org.controller.dto.request.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocationCreateReqDTO {
    @NotBlank
    private String name;
    @NotBlank
    private String address;
    @NotBlank
    private String country;
    @NotBlank
    private String city;
    @NotNull
    private Integer zipCode;
    @NotNull
    private Long accountId;
}
