package com.we.hack.dto;

public class HackathonDto {
    private Long id;
    private String title;
    private String description;
    private String date;
    private String status;
    private Long organizerId;

    // Default constructor
    public HackathonDto() {}

    // Constructor with all fields
    public HackathonDto(Long id, String title, String description, String date, String status, Long organizerId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.status = status;
        this.organizerId = organizerId;
    }

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDate() { return date; }
    public String getStatus() { return status; }
    public Long getOrganizerId() { return organizerId; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setDate(String date) { this.date = date; }
    public void setStatus(String status) { this.status = status; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    // Builder pattern
    public static HackathonDtoBuilder builder() {
        return new HackathonDtoBuilder();
    }

    public static class HackathonDtoBuilder {
        private Long id;
        private String title;
        private String description;
        private String date;
        private String status;
        private Long organizerId;

        public HackathonDtoBuilder id(Long id) { this.id = id; return this; }
        public HackathonDtoBuilder title(String title) { this.title = title; return this; }
        public HackathonDtoBuilder description(String description) { this.description = description; return this; }
        public HackathonDtoBuilder date(String date) { this.date = date; return this; }
        public HackathonDtoBuilder status(String status) { this.status = status; return this; }
        public HackathonDtoBuilder organizerId(Long organizerId) { this.organizerId = organizerId; return this; }

        public HackathonDto build() {
            return new HackathonDto(id, title, description, date, status, organizerId);
        }
    }
}
