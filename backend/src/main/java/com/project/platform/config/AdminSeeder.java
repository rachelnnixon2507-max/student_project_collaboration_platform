package com.project.platform.config;

import com.project.platform.entity.*;
import com.project.platform.entity.enums.*;
import com.project.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final FacultyFeedbackRepository facultyFeedbackRepository;
    private final ProjectEvaluationRepository projectEvaluationRepository;
    private final ProjectApprovalRepository projectApprovalRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ProjectProgressRepository projectProgressRepository;
    private final FileResourceRepository fileResourceRepository;
    private final MessageRepository messageRepository;
    private final AnnouncementRepository announcementRepository;
    private final TeamMemberReviewRepository teamMemberReviewRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedSampleData() {
        return args -> {
            // 1. Wipe all existing data completely
            teamMemberReviewRepository.deleteAll();
            announcementRepository.deleteAll();
            messageRepository.deleteAll();
            notificationRepository.deleteAll();
            teamJoinRequestRepository.deleteAll();
            fileResourceRepository.deleteAll();
            taskRepository.deleteAll();
            projectProgressRepository.deleteAll();
            projectEvaluationRepository.deleteAll();
            projectApprovalRepository.deleteAll();
            facultyFeedbackRepository.deleteAll();
            projectMemberRepository.deleteAll();
            projectRepository.deleteAll();
            studentProfileRepository.deleteAll();
            facultyProfileRepository.deleteAll();
            userRepository.deleteAll();

            // 2. Admin (1 Admin)
            userRepository.save(User.builder()
                    .institutionalId("ADM10001")
                    .name("System Admin")
                    .email("admin@college.edu")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

            // 3. 5 Student Leaders (Lead of 1 project each)
            User s1 = userRepository.save(User.builder().institutionalId("STU10001").name("Ananya Menon").email("ananya@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s2 = userRepository.save(User.builder().institutionalId("STU10002").name("Rahul Krishnan").email("rahul@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s3 = userRepository.save(User.builder().institutionalId("STU10003").name("Arjun Das").email("arjun@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s4 = userRepository.save(User.builder().institutionalId("STU10004").name("Sneha Nair").email("sneha@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s5 = userRepository.save(User.builder().institutionalId("STU10005").name("Kiran Paul").email("kiran@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());

            studentProfileRepository.save(StudentProfile.builder().userId(s1.getId()).department("CSE").skills("Java, Spring Boot, React, MySQL, Docker").bio("Full-stack developer & project lead for Campus Smart Parking.").githubUrl("https://github.com/ananya-dev").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s2.getId()).department("ECE").skills("Python, IoT, C++, Embedded Systems, MQTT").bio("Hardware & AI developer leading AI Study Planner.").githubUrl("https://github.com/rahul-iot").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s3.getId()).department("IT").skills("Node.js, Docker, MongoDB, React, Kubernetes").bio("Cloud architect & backend lead for IoT Lab Monitor.").githubUrl("https://github.com/arjun-cloud").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s4.getId()).department("CSE").skills("Python, PyTorch, FastAPI, Machine Learning, NLP").bio("AI specialist leading Automated Code Reviewer.").githubUrl("https://github.com/sneha-ai").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s5.getId()).department("MECH").skills("SolidWorks, MATLAB, Arduino, Robotics, ROS").bio("Robotics engineer leading Autonomous Drone Delivery.").githubUrl("https://github.com/kiran-robotics").build());

            // 4. 5 Students with NO Memberships (0 projects, ready to join)
            User s6 = userRepository.save(User.builder().institutionalId("STU10006").name("Devika R").email("devika@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s7 = userRepository.save(User.builder().institutionalId("STU10007").name("Siddharth Verma").email("siddharth@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s8 = userRepository.save(User.builder().institutionalId("STU10008").name("Meenakshi Pillai").email("meenakshi@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s9 = userRepository.save(User.builder().institutionalId("STU10009").name("Vishnu Prasad").email("vishnu@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s10 = userRepository.save(User.builder().institutionalId("STU10010").name("Rhea Thomas").email("rhea@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());

            studentProfileRepository.save(StudentProfile.builder().userId(s6.getId()).department("CSE").skills("React, TypeScript, Next.js, TailwindCSS, Figma").bio("Frontend developer looking for exciting web app projects.").githubUrl("https://github.com/devika-frontend").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s7.getId()).department("IT").skills("Java, Spring Cloud, PostgreSQL, Microservices, Redis").bio("Backend specialist interested in scalable distributed systems.").githubUrl("https://github.com/siddharth-backend").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s8.getId()).department("AIDS").skills("Python, TensorFlow, Scikit-learn, Data Analytics, Pandas").bio("Data science & AI enthusiast seeking ML/NLP projects.").githubUrl("https://github.com/meenakshi-data").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s9.getId()).department("ECE").skills("C, C++, ESP32, Embedded C, Raspberry Pi").bio("Hardware enthusiast looking for IoT and automation teams.").githubUrl("https://github.com/vishnu-embedded").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s10.getId()).department("CSE").skills("UI/UX Design, Figma, User Research, Wireframing, CSS").bio("Product designer looking to build sleek web & mobile experiences.").githubUrl("https://github.com/rhea-design").build());

            // 5. 5 Faculty Members
            User f1 = userRepository.save(User.builder().institutionalId("FAC10001").name("Dr. Meera Nair").email("meera@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f2 = userRepository.save(User.builder().institutionalId("FAC10002").name("Dr. Joseph Mathew").email("joseph@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f3 = userRepository.save(User.builder().institutionalId("FAC10003").name("Prof. Priya Sharma").email("priya@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f4 = userRepository.save(User.builder().institutionalId("FAC10004").name("Dr. Rajesh Varma").email("rajesh@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f5 = userRepository.save(User.builder().institutionalId("FAC10005").name("Prof. Thomas Kurian").email("thomas@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());

            facultyProfileRepository.save(FacultyProfile.builder().userId(f1.getId()).department("CSE").designation("Professor & HOD").specialization("Machine Learning & Software Engineering").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f2.getId()).department("ECE").designation("Associate Professor").specialization("Embedded Systems & Robotics").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f3.getId()).department("IT").designation("Assistant Professor").specialization("Cloud Computing & Cyber Security").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f4.getId()).department("AIDS").designation("Professor").specialization("Artificial Intelligence & Data Science").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f5.getId()).department("MECH").designation("Assistant Professor").specialization("Mechatronics & Automated Control").build());

            // 6. Projects (Projects with Leader membership)
            Project p1 = projectRepository.save(Project.builder().title("Campus Smart Parking").description("IoT and AI-based real-time parking spot reservation system for campus vehicles.").requiredSkills("Java, Spring Boot, React, IoT").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s1.getId()).build());
            Project p2 = projectRepository.save(Project.builder().title("AI Study Planner").description("Smart calendar application generating personalized study routines using ML algorithms.").requiredSkills("Python, React, FastAPI, ML").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s2.getId()).build());
            Project p3 = projectRepository.save(Project.builder().title("IoT Lab Monitor").description("Sensors monitoring temperature, humidity, and energy usage in university engineering laboratories.").requiredSkills("C++, Microcontrollers, MQTT, Cloud").status(ProjectStatus.OPEN).maxMembers(3).createdBy(s3.getId()).build());
            Project p4 = projectRepository.save(Project.builder().title("Automated Code Reviewer").description("AI-powered static analysis platform analyzing student Git commits for code smells and bugs.").requiredSkills("Python, PyTorch, FastAPI, React").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s4.getId()).build());
            Project p5 = projectRepository.save(Project.builder().title("Autonomous Drone Delivery").description("Indoor quadcopter navigation and payload delivery system for urgent campus parcel transport.").requiredSkills("Robotics, ROS, C++, Arduino, Computer Vision").status(ProjectStatus.OPEN).maxMembers(5).createdBy(s5.getId()).build());
            
            // Additional projects led by Rahul Krishnan (STU10002) - total 3 projects for Rahul
            Project p6 = projectRepository.save(Project.builder().title("Smart Campus Microgrid").description("IoT-based real-time telemetry and renewable energy grid load optimizer for campus labs and hostels.").requiredSkills("Python, IoT, MQTT, React, C++").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s2.getId()).build());
            Project p7 = projectRepository.save(Project.builder().title("Autonomous Rover Navigator").description("Edge-AI powered terrain mapping and autonomous rover navigation for campus obstacle courses.").requiredSkills("Embedded Systems, ROS, Python, C++, OpenCV").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s2.getId()).build());

            // Project Members: Exactly 1 Member (Leader) per Project
            projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s1.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s2.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p3.getId()).studentId(s3.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p4.getId()).studentId(s4.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p5.getId()).studentId(s5.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p6.getId()).studentId(s2.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p7.getId()).studentId(s2.getId()).role(ProjectMemberRole.LEADER).build());

            // 7. Initial Tasks assigned to their respective Leaders
            taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s1.getId()).title("Database Schema Design").description("Entity relationships for parking slots, reservations, and IoT sensor telemetry").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(3)).build());
            taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s1.getId()).title("Sensor Data API Endpoints").description("REST endpoints for ultrasonic hardware sensors to transmit slot occupancy").status(TaskStatus.IN_PROGRESS).progress(50).dueDate(LocalDateTime.now().plusDays(4)).build());
            taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s1.getId()).title("Real-Time Slot Reservation UI").description("Interactive React grid allowing students to reserve parking spots").status(TaskStatus.TODO).progress(0).dueDate(LocalDateTime.now().plusDays(7)).build());

            taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s2.getId()).title("Study Session Algorithm").description("Heuristic recommendation engine for student study blocks").status(TaskStatus.IN_PROGRESS).progress(40).dueDate(LocalDateTime.now().plusDays(5)).build());
            taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s2.getId()).title("Calendar Sync Integration").description("Google Calendar API OAuth flow for schedule syncing").status(TaskStatus.TODO).progress(0).dueDate(LocalDateTime.now().plusDays(8)).build());

            taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s3.getId()).title("MQTT Broker Deployment").description("Mosquitto broker setup on cloud instance").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(2)).build());
            taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s3.getId()).title("ESP32 Sensor Integration").description("C++ code reading DHT22 and current sensors").status(TaskStatus.IN_PROGRESS).progress(30).dueDate(LocalDateTime.now().plusDays(6)).build());

            taskRepository.save(Task.builder().projectId(p4.getId()).assignedTo(s4.getId()).title("Static AST Parser Setup").description("Python AST token parser for python & java code submissions").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(1)).build());
            taskRepository.save(Task.builder().projectId(p4.getId()).assignedTo(s4.getId()).title("LLM Prompt Engineering").description("Fine-tuned prompts for code review suggestions").status(TaskStatus.IN_PROGRESS).progress(60).dueDate(LocalDateTime.now().plusDays(3)).build());

            taskRepository.save(Task.builder().projectId(p5.getId()).assignedTo(s5.getId()).title("CAD Chassis 3D Printing").description("Lightweight drone frame modeling in SolidWorks").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(4)).build());
            taskRepository.save(Task.builder().projectId(p5.getId()).assignedTo(s5.getId()).title("PID Flight Controller Firmware").description("Arduino and MPU6050 gyro stabilization code").status(TaskStatus.IN_PROGRESS).progress(45).dueDate(LocalDateTime.now().plusDays(5)).build());

            taskRepository.save(Task.builder().projectId(p6.getId()).assignedTo(s2.getId()).title("Smart Meter Telemetry Driver").description("MODBUS and MQTT telemetry driver for solar battery bank").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(2)).build());
            taskRepository.save(Task.builder().projectId(p6.getId()).assignedTo(s2.getId()).title("Peak Demand Forecasting Model").description("Time-series forecasting model for hostel power consumption").status(TaskStatus.IN_PROGRESS).progress(55).dueDate(LocalDateTime.now().plusDays(6)).build());

            taskRepository.save(Task.builder().projectId(p7.getId()).assignedTo(s2.getId()).title("LiDAR SLAM Integration").description("2D LiDAR ROS driver configuration for indoor obstacle maps").status(TaskStatus.IN_PROGRESS).progress(35).dueDate(LocalDateTime.now().plusDays(9)).build());

            // Project Progress Records
            projectProgressRepository.save(ProjectProgress.builder().projectId(p1.getId()).overallProgress(50).lastActivityAt(LocalDateTime.now().minusHours(1)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p2.getId()).overallProgress(20).lastActivityAt(LocalDateTime.now().minusHours(3)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p3.getId()).overallProgress(65).lastActivityAt(LocalDateTime.now().minusDays(1)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p4.getId()).overallProgress(80).lastActivityAt(LocalDateTime.now().minusHours(5)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p5.getId()).overallProgress(72).lastActivityAt(LocalDateTime.now().minusHours(2)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p6.getId()).overallProgress(60).lastActivityAt(LocalDateTime.now().minusHours(2)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p7.getId()).overallProgress(35).lastActivityAt(LocalDateTime.now().minusHours(4)).build());

            // File Resources for Project 1
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("System_Architecture_Diagram_v1.2.png").fileType("image/png").fileSize(1024L * 850).resourceType(FileResourceType.DIAGRAM).fileUrl("/api/files/download/1").description("High-level system topology connecting ultrasonic sensors to Spring Boot backend").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Smart_Parking_SRS_Document.pdf").fileType("application/pdf").fileSize(1024L * 2400).resourceType(FileResourceType.DOCUMENT).fileUrl("/api/files/download/2").description("Comprehensive Software Requirements Specification approved by faculty mentor").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Smart-Parking-IoT-Firmware Repo").fileType("text/html").resourceType(FileResourceType.CODE).fileUrl("https://github.com/campus-project/smart-parking-iot").description("Official GitHub repository containing ESP32 sensor drivers and MQTT client code").build());

            // Faculty Mentorship Feedback
            facultyFeedbackRepository.save(FacultyFeedback.builder()
                    .projectId(p1.getId())
                    .facultyId(f1.getId())
                    .feedbackText("Solid progress on the system architecture and sensor integration. Team recruitment is open.")
                    .rating(5)
                    .build());

            // Announcements
            announcementRepository.save(Announcement.builder()
                    .title("Capstone Project Collaboration Round Open")
                    .content("5 new project teams are currently recruiting members. Students without teams can browse projects and submit join requests.")
                    .scope(AnnouncementScope.ALL)
                    .createdBy(s1.getId())
                    .build());
        };
    }
}
