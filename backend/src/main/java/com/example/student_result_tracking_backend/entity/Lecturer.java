package com.example.student_result_tracking_backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "lecturers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lecturer extends User {
    @Column(unique = true, nullable = false)
    private String employeeId;

    @ManyToMany
    @JoinTable(
            name = "lecturer_courses",
            joinColumns = @JoinColumn(name = "lecturer_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "course_id", referencedColumnName = "id")
    )
    @JsonBackReference("course-lecturers")
    private Set<Course> courses = new HashSet<>();

    public void assignCourse(Course course) {
        courses.add(course);
        course.getLecturers().add(this);
    }

    // Prevent circular reference in equals & hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Lecturer lecturer = (Lecturer) o;
        return Objects.equals(getId(), lecturer.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId());
    }
}
