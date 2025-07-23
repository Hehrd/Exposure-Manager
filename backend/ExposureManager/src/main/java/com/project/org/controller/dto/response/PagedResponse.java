package com.project.org.controller.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class PagedResponse<T> {
    private List<T> content;
    private int totalElements;
    private int pageNumber;
    private int pageSize;
}
