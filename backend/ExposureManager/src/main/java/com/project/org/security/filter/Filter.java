package com.project.org.security.filter;

import org.springframework.web.filter.OncePerRequestFilter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public abstract class Filter extends OncePerRequestFilter {
    private final Set<String> publicUrls;

    public Filter() {
        this.publicUrls = initPublicUrls();
    }

    protected boolean isUrlPublic(String url) {
        return publicUrls.contains(url);
    }

    private Set<String> initPublicUrls() {
        Set<String> publicUrls = new HashSet<>();
        publicUrls.add("/login");
        publicUrls.add("/signup");
        return publicUrls;
    }
}
