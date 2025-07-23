package com.project.org.controller.dto.response;

import lombok.Data;

@Data
public class PagedResponse {
    private ResDTO content;
    private int totalElements;
    private int pageNumber;
    private int pageSize;
}
