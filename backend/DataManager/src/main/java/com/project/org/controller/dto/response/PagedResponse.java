package com.project.org.controller.dto.response;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PagedResponse<T> {

    public PagedResponse() {
        content = new ArrayList<>();
    }

    private List<T> content;
    private int totalElements;
    private int pageNumber;
    private int pageSize;

    public void addElement(T element) {
        content.add(element);
    }
}
