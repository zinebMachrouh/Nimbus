package com.example.backend.utils;

import lombok.Getter;

import java.util.HashSet;
import java.util.Set;

public class TokenBlacklist {
    @Getter
    private static final Set<String> blacklist = new HashSet<>();

    public static void add(String token) {
        blacklist.add(token);
    }

    public static boolean contains(String token) {
        return blacklist.contains(token);
    }

    public static void clean() {
        if (blacklist.size() == 2) {
            blacklist.clear();
        }
    }
}
