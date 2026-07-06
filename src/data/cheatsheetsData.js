export const cheatsheets = [
  {
    id: "spring-boot",
    title: "Spring Boot Cheat Sheet",
    description: "The ultimate 1-2 YOE interview preparation handbook covering auto-configuration, IoC, DI, JPA, transactions, caching, security, and performance tuning.",
    category: "Backend Development",
    yoe: "1-2 YOE",
    readTime: "15 min read",
    icon: "spring",
    content: `# Spring Boot Cheat Sheet (1–2 YOE Interview Edition)

## 1. What is Spring Boot?
Spring Boot is an extension of the Spring Framework that eliminates boilerplate configuration and setup. It provides embedded servers, auto-configuration, and production-ready features so developers can focus entirely on business logic rather than infrastructure.

**Key Benefits:**
- Zero XML configuration
- Embedded Tomcat, Jetty, or Undertow
- Auto-configures beans based on classpath
- Production monitoring via Actuator
- Single executable JAR deployment

**Spring Boot vs Spring Framework:**

| Feature | Spring Framework | Spring Boot |
|---|---|---|
| Configuration | Manual XML/Java | Auto-configured |
| Server | External Tomcat | Embedded |
| Setup Time | High | Very low |
| Dependencies | Manual management | Starter bundles |
| Learning Curve | Steep | Beginner friendly |

---

## 2. Project Structure

\`\`\`
src/main/java/com/example/
├── controller/       ← HTTP request/response handling
├── service/          ← Business logic
├── repository/       ← Database access
├── model/            ← Entities and DTOs
└── Application.java  ← Main entry point

src/main/resources/
├── application.properties  ← App configuration
└── static/                 ← Static files
\`\`\`

---

## 3. Main Application Class

\`@SpringBootApplication\` is a convenience annotation that combines three annotations into one. When \`SpringApplication.run()\` is called, it creates the \`ApplicationContext\`, triggers auto-configuration, and starts the embedded server.

\`\`\`java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

\`@SpringBootApplication\` internally combines:
- \`@Configuration\` — marks class as bean source
- \`@EnableAutoConfiguration\` — enables auto-config
- \`@ComponentScan\` — scans current package and sub-packages

### 3.1 Spring Boot Auto Configuration ⭐⭐⭐⭐⭐ (NEW)
\`@EnableAutoConfiguration\` tells Spring Boot to guess and configure beans based on the jars present on the classpath. Conceptually (not implementation-level):

- Older Spring Boot (≤2.x) used \`META-INF/spring.factories\` to list all auto-configuration classes.
- Spring Boot 2.7+/3.x moved to \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\` — a simple text file listing auto-config classes, replacing \`spring.factories\` for this purpose.
- Each auto-config class is annotated with \`@Conditional...\` annotations (\`@ConditionalOnClass\`, \`@ConditionalOnMissingBean\`, etc.) so it only activates when relevant classes/beans exist.

You just need to explain **why** it exists (convention over configuration) and **how** Spring decides what to configure — you don't need to reproduce Spring's internal source.

### 3.2 Component Scan (NEW)
\`@ComponentScan\` tells Spring which packages to scan for \`@Component\`, \`@Service\`, \`@Repository\`, \`@Controller\`, etc.

- By default, \`@SpringBootApplication\` scans the package it's in **and all sub-packages**.
- If a bean lives outside that package tree, it won't be picked up unless you explicitly add:

\`\`\`java
@SpringBootApplication
@ComponentScan(basePackages = {"com.example", "com.othercompany.lib"})
public class Application { }
\`\`\`

This is why "why isn't my bean being picked up?" is almost always a component-scan / package-location problem in interviews.

---

## 4. Spring Starters

Starters are pre-packaged dependency bundles for specific features. Instead of manually finding and matching compatible library versions, you add one starter and Spring Boot handles the rest.

| Starter | Purpose |
|---|---|
| spring-boot-starter-web | REST APIs and web apps |
| spring-boot-starter-data-jpa | JPA and Hibernate |
| spring-boot-starter-security | Authentication and authorization |
| spring-boot-starter-test | JUnit, Mockito, MockMvc |
| spring-boot-starter-actuator | Monitoring and health checks |
| spring-boot-starter-validation | Bean validation |

### 4.1 Spring Boot Starter Internals (NEW)
Interviewers like to check you understand starters aren't magic — they're just **curated dependency + auto-config bundles**.

\`spring-boot-starter-web\` pulls in, and auto-configures:
- **Embedded Tomcat** — so you don't need an external server
- **Jackson** — for automatic JSON serialization/deserialization
- **Spring MVC** — \`DispatcherServlet\`, \`@Controller\` support, request mapping
- **Validation** (partially, full validation needs \`starter-validation\`) — Hibernate Validator on the classpath

Each of these is only auto-configured **if its jar is present** — that's the \`@ConditionalOnClass\` mechanism from 3.1 in action.

---

## 5. Core Spring Concepts

### Inversion of Control (IoC)
IoC means Spring takes control of object creation instead of you using the \`new\` keyword manually. The Spring IoC container creates, wires, and manages all objects (beans) throughout the application lifecycle.

\`\`\`java
// Without IoC — you manage everything
UserService service = new UserService(new UserRepository());

// With IoC — Spring manages everything
@Autowired
UserService service;
\`\`\`

### Dependency Injection (DI)
DI is the mechanism through which IoC is implemented. Spring injects required dependencies into a class automatically, removing tight coupling between components.

\`\`\`java
// 1. Constructor Injection — Recommended
@Service
public class OrderService {
    private final PaymentService paymentService;
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}

// 2. Setter Injection — for optional dependencies
@Service
public class NotificationService {
    private EmailService emailService;
    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}

// 3. Field Injection — avoid in production
@Autowired
private UserRepository userRepository;
\`\`\`

| Type | Testable | Immutable | Recommended |
|---|---|---|---|
| Constructor | Yes | Yes | Yes |
| Setter | Partial | No | Optional use |
| Field | No | No | No |

### 5.1 Bean Lifecycle ⭐⭐⭐⭐⭐ (NEW)
Every bean goes through: **Instantiation → Dependency Injection → \`@PostConstruct\` → ready for use → \`@PreDestroy\` (on context shutdown)**.

\`\`\`java
@Component
public class ConnectionManager {

    @PostConstruct
    public void init() {
        // called once, right after DI is done — e.g. open a connection pool
        System.out.println("Bean initialized");
    }

    @PreDestroy
    public void cleanup() {
        // called just before the bean is destroyed — e.g. close resources
        System.out.println("Bean about to be destroyed");
    }
}
\`\`\`

Also know the interface-based alternatives (older style, still asked):

\`\`\`java
public class ConnectionManager implements InitializingBean, DisposableBean {

    @Override
    public void afterPropertiesSet() {
        // equivalent to @PostConstruct
    }

    @Override
    public void destroy() {
        // equivalent to @PreDestroy
    }
}
\`\`\`

\`@PostConstruct\`/\`@PreDestroy\` are preferred today since they don't couple your class to Spring interfaces.

### 5.2 Bean Scopes ⭐⭐⭐⭐⭐ (NEW)

| Scope | Behavior |
|---|---|
| **Singleton** (default) | One instance per Spring container, shared everywhere |
| **Prototype** | New instance every time the bean is requested |
| **Request** | One instance per HTTP request (web apps only) |
| **Session** | One instance per HTTP session (web apps only) |
| **Application** | One instance per \`ServletContext\` (shared across the whole web app, similar to singleton but at the servlet-context level) |

\`\`\`java
@Component
@Scope("prototype")
public class ReportGenerator { }
\`\`\`

Common gotcha asked in interviews: injecting a **prototype** bean into a **singleton** bean only creates it once, because the singleton is only constructed once — you need \`ObjectProvider\`/\`@Lookup\` to get a fresh prototype bean on every call.

### 5.3 @Qualifier vs @Primary ⭐⭐⭐⭐⭐ (NEW)
Used when multiple beans implement the same interface and Spring doesn't know which one to inject.

\`\`\`java
public interface PaymentService { }

@Service
public class PaypalService implements PaymentService { }

@Service
@Primary
public class StripeService implements PaymentService { }
\`\`\`

- \`@Primary\` — marks a **default** bean to inject when there's ambiguity. If nothing else is specified, \`StripeService\` wins.
- \`@Qualifier\` — explicitly picks a bean by name, overriding \`@Primary\` at the injection point:

\`\`\`java
@Service
public class CheckoutService {
    private final PaymentService paymentService;

    public CheckoutService(@Qualifier("paypalService") PaymentService paymentService) {
        this.paymentService = paymentService; // forces Paypal even though Stripe is @Primary
    }
}
\`\`\`

Rule of thumb: \`@Primary\` = default choice, \`@Qualifier\` = explicit override, and \`@Qualifier\` wins when both are present at an injection point.

### 5.4 Circular Dependency (NEW)
Happens when Bean A depends on Bean B, and Bean B depends on Bean A.

**Constructor Injection catches it immediately** — at startup, Spring throws \`BeanCurrentlyInCreationException\` because it can't fully construct either bean without the other already existing.

\`\`\`java
@Service
public class AService {
    public AService(BService bService) { }
}

@Service
public class BService {
    public BService(AService aService) { } // fails fast at startup
}
\`\`\`

**Field Injection hides it** — because fields are set *after* the bean is constructed (via reflection), Spring can create both beans first as "empty shells" and inject into each other afterward, so the circular reference silently works. This is one of the strongest arguments interviewers expect for preferring constructor injection: it surfaces design problems early instead of masking them.

### Beans
A Bean is any Java object created and managed by the Spring IoC container. You register beans using stereotype annotations or \`@Bean\` inside a \`@Configuration\` class.

\`\`\`java
// Via annotation
@Component
public class EmailValidator { }

// Via @Configuration
@Configuration
public class AppConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
\`\`\`

### Stereotype Annotations

| Annotation | Layer | Extra Behavior |
|---|---|---|
| @Component | Any | Generic bean |
| @Service | Business | Semantic clarity |
| @Repository | Persistence | DB exception translation |
| @Controller | Presentation | Returns views |
| @RestController | Presentation | Returns JSON directly |

---

## 6. Configuration

Spring Boot externalizes configuration so the same JAR can run in dev, test, and production without code changes. Configuration sources follow a priority order — higher sources override lower ones.

**Priority order (highest to lowest):**
1. Command line arguments
2. Java system properties
3. Environment variables
4. \`application.properties\` or \`application.yml\`
5. Default properties

\`\`\`properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=\${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
logging.level.com.example=DEBUG
\`\`\`

\`\`\`yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: \${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
\`\`\`

### Profiles
Profiles let you define environment-specific configuration files. When a profile is active, Spring Boot loads both \`application.properties\` and the profile-specific file, with the profile file taking priority.

\`\`\`properties
# Activate in application.properties
spring.profiles.active=dev
\`\`\`
\`\`\`bash
# Or at runtime
java -jar app.jar --spring.profiles.active=prod
\`\`\`

Create separate files per environment: \`application-dev.properties\`, \`application-prod.properties\`, \`application-test.properties\`.

### 6.1 Environment Variables: @ConfigurationProperties vs @Value (NEW)

\`\`\`java
// @Value — good for a single, one-off property
@Value("\${jwt.secret}")
private String jwtSecret;
\`\`\`

\`\`\`java
// @ConfigurationProperties — good for a group of related properties, type-safe binding
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private long expiration;
    // getters/setters
}
\`\`\`
\`\`\`properties
jwt.secret=mysecret
jwt.expiration=86400000
\`\`\`

| | @Value | @ConfigurationProperties |
|---|---|---|
| Best for | single property | grouped/nested properties |
| Type safety | manual per field | binds to POJO automatically |
| SpEL support | Yes | No |
| Relaxed binding (\`kebab-case\`, \`camelCase\`, \`UPPER_CASE\` env vars all map together) | No | Yes |

### 6.2 Profiles in Real Projects (NEW)
In real companies, environments usually go: **dev → sit (system integration testing) → uat (user acceptance testing) → prod.**

- Each environment has its own \`application-{profile}.properties\` (DB URLs, external API endpoints, log levels, feature flags).
- Secrets (DB passwords, API keys) are **never** hardcoded even in profile files — they come from environment variables, a vault (HashiCorp Vault, AWS Secrets Manager), or CI/CD pipeline secrets, and are referenced as \`\${DB_PASSWORD}\`.
- Config server patterns (e.g. Spring Cloud Config) are used in larger microservice setups so config isn't baked into each service's jar.

### 6.3 Spring Boot Properties — Quick Recap (NEW)
- \`application.properties\` / \`application.yml\` — main config file(s), YAML is preferred for hierarchical/nested config.
- Environment variables — override file-based config, used for anything environment-specific or secret.
- Secrets — should never live in git; injected at runtime via env vars or a secrets manager.

---

## 7. REST API Development

Spring Boot makes building REST APIs simple using annotation-based controllers and automatic JSON serialization via Jackson. REST follows stateless communication where each request contains all the information needed to process it.

**HTTP Method to Annotation mapping:**

| Annotation | HTTP Method | Use Case |
|---|---|---|
| @GetMapping | GET | Fetch resource |
| @PostMapping | POST | Create resource |
| @PutMapping | PUT | Full update |
| @PatchMapping | PATCH | Partial update |
| @DeleteMapping | DELETE | Remove resource |

**Complete CRUD Controller:**

\`\`\`java
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(201).body(userService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id,
                                       @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
\`\`\`

**Request data extraction:**

\`\`\`java
// From URL path: /users/5
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) { }

// From query string: /users?role=admin&page=0
@GetMapping
public List<User> getUsers(
    @RequestParam String role,
    @RequestParam(defaultValue = "0") int page) { }

// From request body (JSON → Java object)
@PostMapping
public User create(@RequestBody UserRequest request) { }
\`\`\`

**HTTP Status Codes:**

| Code | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource missing |
| 500 | Server Error | Unexpected failure |

### 7.1 ResponseEntity Deep Dive (NEW)
\`ResponseEntity<T>\` lets you control status code, headers, and body together instead of just returning a POJO.

\`\`\`java
ResponseEntity.ok(user);                              // 200 with body
ResponseEntity.ok().body(user);                        // same, explicit body()
ResponseEntity.status(201).body(user);                  // custom status + body
ResponseEntity.created(URI.create("/api/users/5")).build(); // 201 with Location header
ResponseEntity.badRequest().body(errorMap);              // 400 with body
ResponseEntity.notFound().build();                        // 404, no body
ResponseEntity.noContent().build();                        // 204, no body
ResponseEntity.ok()
    .header("X-Custom-Header", "value")
    .body(user);                                            // custom header + body
\`\`\`

Interviewers want to hear: \`ResponseEntity\` gives you fine-grained control the plain return type doesn't — status code, headers, and body, all explicit.

### 7.2 DTO Mapping (NEW)
Never expose your JPA \`@Entity\` directly in the API — it leaks DB structure, causes lazy-loading serialization issues, and tightly couples your API contract to your schema.

**Flow:** \`Entity ↔ DTO ↔ Controller\` — the DTO is the contract exposed to clients; the Entity stays internal to the persistence layer.

\`\`\`java
// manual mapping
public UserDto toDto(User user) {
    return new UserDto(user.getId(), user.getName(), user.getEmail());
}
\`\`\`

\`\`\`java
// MapStruct — compile-time generated mapper, fast, type-safe
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(UserDto dto);
}
\`\`\`

\`\`\`java
// ModelMapper — reflection-based, less boilerplate but slower at runtime
ModelMapper modelMapper = new ModelMapper();
UserDto dto = modelMapper.map(user, UserDto.class);
\`\`\`

| | MapStruct | ModelMapper | Manual |
|---|---|---|---|
| Performance | Fastest (compile-time) | Slower (reflection) | Fastest |
| Boilerplate | Low | Lowest | High |
| Debuggability | Easy (generated code visible) | Harder | Easiest |

### 7.3 API Versioning (NEW)
Needed once an API has external consumers and you must change the contract without breaking them.

\`\`\`java
// URI versioning — most common, easiest to understand
@RequestMapping("/api/v1/users")
@RequestMapping("/api/v2/users")
\`\`\`

\`\`\`java
// Header versioning — keeps URLs clean
@GetMapping(value = "/users", headers = "X-API-Version=1")
@GetMapping(value = "/users", headers = "X-API-Version=2")
\`\`\`

URI versioning is simpler and more common in practice; header versioning is considered more "RESTful" since the resource URL doesn't change.

### 7.4 File Upload (NEW)
\`\`\`java
@PostMapping("/upload")
public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty()) {
        return ResponseEntity.badRequest().body("File is empty");
    }
    String fileName = file.getOriginalFilename();
    Path path = Paths.get("uploads/" + fileName);
    Files.write(path, file.getBytes());
    return ResponseEntity.ok("Uploaded: " + fileName);
}
\`\`\`

\`\`\`properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
\`\`\`

\`MultipartFile\` gives you \`getOriginalFilename()\`, \`getBytes()\`, \`getSize()\`, \`getContentType()\` — always validate size/type before saving.

---

## 8. Validation and Exception Handling

Bean Validation API provides declarative constraints on request objects. When \`@Valid\` is used in a controller, Spring automatically validates the incoming data before the method executes and throws \`MethodArgumentNotValidException\` if it fails.

**Validation annotations:**

| Annotation | Purpose |
|---|---|
| @NotNull | Field must not be null |
| @NotBlank | String must not be empty |
| @Email | Must be valid email format |
| @Size(min, max) | String length range |
| @Min / @Max | Numeric range |
| @Pattern(regexp) | Must match regex |

**DTO with validation:**

\`\`\`java
public class UserRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50)
    private String name;

    @NotBlank
    @Email(message = "Invalid email format")
    private String email;

    @Min(value = 18, message = "Must be at least 18")
    private Integer age;
}
\`\`\`

**Global Exception Handler:**

\`@RestControllerAdvice\` centralizes exception handling across all controllers. Without it, Spring returns ugly stack traces. With it, every error returns a clean, consistent JSON response.

\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
                .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse(500, "Unexpected error occurred"));
    }
}
\`\`\`

### 8.1 Optional (NEW)
\`Optional<T>\` avoids \`NullPointerException\` by making "value might be absent" explicit in the type system.

\`\`\`java
Optional<User> userOpt = userRepository.findById(id);

userOpt.map(User::getName);                          // transform if present, else empty Optional
userOpt.orElse(new User());                            // default value if empty
userOpt.orElseGet(() -> buildDefaultUser());            // lazy default — only computed if empty
userOpt.orElseThrow(() -> new ResourceNotFoundException("User not found")); // throw if empty
\`\`\`

| Method | Behavior |
|---|---|
| \`map()\` | Applies a function if a value is present, otherwise returns empty |
| \`orElse(x)\` | Returns \`x\` if empty — **\`x\` is always evaluated eagerly**, even if not needed |
| \`orElseGet(supplier)\` | Returns supplier's result if empty — only evaluated **lazily**, when needed |
| \`orElseThrow()\` | Throws the given exception if empty |

Common interview gotcha: \`orElse()\` always evaluates its argument (e.g. \`orElse(new User())\` constructs a \`User\` every time, even when the Optional has a value) — prefer \`orElseGet()\` when the default is expensive to compute.

---

## 9. Database Integration — Spring Data JPA

Spring Data JPA sits on top of JPA (specification) and Hibernate (implementation) to eliminate manual SQL and \`ResultSet\` handling. You define an interface, and Spring generates the full implementation at runtime.

### Entity Mapping

\`\`\`java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
\`\`\`

**Primary Key Generation Strategies:**

| Strategy | Description | Best For |
|---|---|---|
| IDENTITY | DB auto-increment | MySQL, PostgreSQL |
| SEQUENCE | DB sequence object | Oracle, PostgreSQL |
| AUTO | JPA picks strategy | Quick prototyping |
| TABLE | Separate ID table | Rarely used |

### Repository Layer

\`\`\`java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByNameContaining(String keyword);
    List<User> findByAgeGreaterThanEqual(int age);

    @Query("SELECT u FROM User u WHERE u.age > :age ORDER BY u.name ASC")
    List<User> findUsersOlderThan(@Param("age") int age);

    @Query(value = "SELECT * FROM users WHERE email LIKE %:domain%",
           nativeQuery = true)
    List<User> findByEmailDomain(@Param("domain") String domain);

    Page<User> findByDepartment(String department, Pageable pageable);
}
\`\`\`

**Pagination and Sorting:**

\`\`\`java
Pageable pageable = PageRequest.of(0, 10, Sort.by("name").ascending());
Page<User> page = userRepository.findAll(pageable);

page.getContent();       // list of users
page.getTotalPages();    // total pages
page.getTotalElements(); // total count
\`\`\`

### 9.1 Pagination Response: Page vs Slice vs Sort (NEW)

| Type | Knows total count? | Extra query? | Use when |
|---|---|---|---|
| \`Page<T>\` | Yes (\`getTotalElements\`, \`getTotalPages\`) | Yes — runs an extra \`COUNT\` query | You need "page 3 of 20" style UI |
| \`Slice<T>\` | No — only knows if there's a next page (\`hasNext()\`) | No extra count query | Infinite scroll / "load more" UIs where total count is unnecessary overhead |
| \`Sort\` | N/A | N/A | Standalone or combined with \`Pageable\` to define ordering |

\`Slice\` is cheaper than \`Page\` because it skips the count query — pick \`Slice\` when you genuinely don't need the total.

### Entity Relationships

**One-to-One:**
\`\`\`java
@Entity
public class User {
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id")
    private Profile profile;
}
\`\`\`

**One-to-Many / Many-to-One:**
\`\`\`java
@Entity
public class User {
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
}

@Entity
public class Order {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
\`\`\`

**Many-to-Many:**
\`\`\`java
@Entity
public class Student {
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();
}
\`\`\`

**Fetch Types:**

| Type | Behavior | Default for |
|---|---|---|
| EAGER | Loads related data immediately | @OneToOne, @ManyToOne |
| LAZY | Loads related data only when accessed | @OneToMany, @ManyToMany |

Prefer LAZY for collections to avoid loading unnecessary data.

Avoid infinite recursion in bidirectional relationships:
\`\`\`java
@OneToMany(mappedBy = "user")
@JsonManagedReference
private List<Order> orders;

@ManyToOne
@JsonBackReference
private User user;
\`\`\`

### 9.2 N+1 Query Problem ⭐⭐⭐⭐⭐ (NEW)
Happens when you fetch a list of entities (1 query), then accessing a **LAZY** relationship on each one triggers a separate query per entity (N queries) — 1 + N total queries instead of 1.

\`\`\`java
List<User> users = userRepository.findAll();   // 1 query
for (User u : users) {
    u.getOrders().size();                       // N additional queries — one per user!
}
\`\`\`

**Fixes:**

\`\`\`java
// JOIN FETCH in JPQL — pulls the association in the same query
@Query("SELECT u FROM User u JOIN FETCH u.orders")
List<User> findAllWithOrders();
\`\`\`

\`\`\`java
// @EntityGraph — declarative, tells Spring which associations to eagerly load for this query only
@EntityGraph(attributePaths = {"orders"})
List<User> findAll();
\`\`\`

Both solve it by collapsing what would be N+1 queries into 1 or 2. This is one of the most commonly asked JPA questions at any experience level.

### 9.3 Specifications (NEW)
Used for building **dynamic queries** where filters are optional/combinable at runtime (e.g. a search endpoint with many optional filter params) — very common in enterprise CRUD apps.

\`\`\`java
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> { }

public class UserSpecifications {
    public static Specification<User> hasName(String name) {
        return (root, query, cb) -> name == null ? null : cb.equal(root.get("name"), name);
    }
    public static Specification<User> hasMinAge(Integer age) {
        return (root, query, cb) -> age == null ? null : cb.greaterThanOrEqualTo(root.get("age"), age);
    }
}

// Usage — combine filters dynamically, skipping nulls
Specification<User> spec = Specification.where(UserSpecifications.hasName(name))
                                          .and(UserSpecifications.hasMinAge(minAge));
List<User> results = userRepository.findAll(spec);
\`\`\`

### 9.4 Auditing (NEW)
Automatically tracks who created/modified a record and when, without manual code in every service method.

\`\`\`java
@Configuration
@EnableJpaAuditing
public class JpaConfig { }

@Entity
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
\`\`\`

Combine with \`@CreatedBy\`/\`@LastModifiedBy\` and an \`AuditorAware\` bean to also capture the current user.

### 9.5 Hibernate: save() vs persist() vs merge() vs saveAndFlush() (NEW)

| Method | Returns | Behavior |
|---|---|---|
| \`persist()\` | void | Adds entity to persistence context; INSERT may be delayed until flush; throws if entity already has an ID mapped to an existing row |
| \`save()\` (Hibernate-specific, not JPA standard) | generated ID | Similar to persist but returns the identifier; can also insert |
| \`merge()\` | the managed entity | Used for **detached** entities — copies state onto a managed entity (or creates one) and returns that managed copy; doesn't affect the object you passed in |
| \`saveAndFlush()\` (Spring Data) | saved entity | Saves **and immediately flushes** to the DB — forces the SQL to run right away instead of waiting for transaction commit |

Rule of thumb: use \`save()\`/\`persist()\` for new entities, \`merge()\` when working with a detached entity (e.g. one that came from a different session/deserialized from a DTO), and \`saveAndFlush()\` when you need the DB write to happen immediately (e.g. before a native query in the same transaction).

### 9.6 Fetch vs Load — findById() vs getReference() (NEW)

\`\`\`java
User user = userRepository.findById(id).orElseThrow();
// Equivalent to EntityManager.find() — hits the DB immediately, returns a fully initialized entity (or empty).

User userRef = userRepository.getReferenceById(id);
// Equivalent to EntityManager.getReference() — returns a lazy PROXY without hitting the DB.
// Throws EntityNotFoundException only when a field is actually accessed, if the row doesn't exist.
\`\`\`

Use \`getReference()\`/\`getReferenceById()\` when you just need to **set a foreign key reference** (e.g. \`order.setUser(userRepository.getReferenceById(userId))\`) without needing the actual user data — saves a SELECT query.

---

## 10. Transaction Management

Transactions ensure that a group of database operations either all succeed or all fail together, maintaining data integrity. Spring Boot provides declarative transaction management through the \`@Transactional\` annotation.

\`\`\`java
@Service
@Transactional
public class OrderService {

    @Transactional(readOnly = true)
    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElseThrow();
    }

    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(buildOrder(request));
        inventoryService.deductStock(request.getItems());
        return order;
    }
}
\`\`\`

**Propagation Types:**

| Propagation | Behavior |
|---|---|
| REQUIRED | Join existing or create new (default) |
| REQUIRES_NEW | Always creates new, suspends existing |
| NESTED | Runs in nested transaction |
| MANDATORY | Must have existing transaction or throws |
| NEVER | Must not have transaction or throws |
| SUPPORTS | Runs in transaction if one exists |
| NOT_SUPPORTED | Suspends existing, runs non-transactionally |

**Isolation Levels:**

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| READ_UNCOMMITTED | Yes | Yes | Yes |
| READ_COMMITTED | No | Yes | Yes |
| REPEATABLE_READ | No | No | Yes |
| SERIALIZABLE | No | No | No |

### 10.1 Optimistic vs Pessimistic Locking (NEW)
Both solve the same problem — two transactions trying to modify the same row concurrently — with different tradeoffs.

**Optimistic Locking** — assumes conflicts are rare; checks a version number at commit time.
\`\`\`java
@Entity
public class Product {
    @Version
    private Long version;
    // ...
}
\`\`\`
When two transactions read the same row and both try to update it, the second commit fails with \`OptimisticLockException\` because the \`version\` column no longer matches — no DB-level lock is held while reading.

**Pessimistic Locking** — assumes conflicts are likely; locks the row at read time so nobody else can touch it until you're done.
\`\`\`java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
Product findByIdForUpdate(@Param("id") Long id);
\`\`\`

| | Optimistic | Pessimistic |
|---|---|---|
| Mechanism | \`@Version\` column check | DB row lock (\`SELECT ... FOR UPDATE\`) |
| Best for | Low contention, high concurrency | High contention (e.g. inventory/stock updates) |
| Cost | Cheap, but requires retry logic on failure | Higher — blocks other transactions |

---

## 11. Async Processing

\`@Async\` allows methods to run in a separate thread so the caller doesn't wait for completion. It is useful for sending emails, notifications, or any long-running task that doesn't need to block the main request.

\`\`\`java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class EmailService {

    @Async("taskExecutor")
    public CompletableFuture<String> sendEmail(String to, String content) {
        return CompletableFuture.completedFuture("Sent");
    }
}
\`\`\`

### 11.1 Scheduling (NEW)
For recurring background jobs (cleanup tasks, report generation, polling) — different from \`@Async\`, which is for one-off offloaded work.

\`\`\`java
@Configuration
@EnableScheduling
public class SchedulingConfig { }

@Component
public class ReportJob {

    @Scheduled(cron = "0 0 1 * * *") // every day at 1 AM
    public void generateDailyReport() { }

    @Scheduled(fixedRate = 5000) // runs every 5 seconds, measured from START of previous run
    public void pollQueue() { }

    @Scheduled(fixedDelay = 5000) // runs every 5 seconds, measured from END of previous run
    public void syncData() { }
}
\`\`\`

| Attribute | Timing measured from |
|---|---|
| \`fixedRate\` | Start of the previous execution — can overlap if the task runs longer than the rate |
| \`fixedDelay\` | End of the previous execution — guarantees no overlap |
| \`cron\` | Standard cron expression — most flexible for specific schedules |

---

## 12. Spring Security

Spring Security intercepts every incoming request through a filter chain before it reaches your controllers. It handles authentication (who are you?) and authorization (what can you do?) in a structured, extensible way.

\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}
\`\`\`

---

## 13. JWT Authentication

JWT (JSON Web Token) is a stateless authentication mechanism where the server issues a signed token after login. The client stores the token and sends it with every request — no session storage needed on the server.

\`\`\`
eyJhbGciOiJIUzI1NiJ9  ← Header (algorithm)
.eyJzdWIiOiJqb2huIn0  ← Payload (user data, expiry)
.SflKxwRJSMeKKF2QT4f  ← Signature (tamper-proof)
\`\`\`

Never store passwords or secrets in the payload — it is Base64 encoded, not encrypted.

\`\`\`java
@Service
public class JwtService {

    @Value("\${jwt.secret}")
    private String secret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        return username.equals(extractUsername(token)) && !isExpired(token);
    }
}
\`\`\`

\`\`\`java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
                                    throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);

        if (username != null &&
            SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(token, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }
}
\`\`\`

---

## 14. CORS Configuration

CORS is a browser security restriction that blocks frontend apps on a different origin from calling your backend. The server must explicitly tell the browser which origins, methods, and headers are allowed.

\`\`\`java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}

// Wire it in SecurityFilterChain
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
\`\`\`

---

## 15. Logging with @Slf4j

Spring Boot uses SLF4J with Logback by default. The \`@Slf4j\` annotation from Lombok auto-generates a logger instance so you can start logging immediately without boilerplate.

**Log Levels (lowest to highest priority):**

| Level | Use For |
|---|---|
| TRACE | Extremely detailed diagnostic info |
| DEBUG | Variable values, method flow |
| INFO | Business events, app startup |
| WARN | Recoverable issues, deprecated usage |
| ERROR | Failures, exceptions |

\`\`\`java
@Slf4j
@Service
public class PaymentService {

    public PaymentResult process(PaymentRequest request) {
        log.info("Processing payment for order: {}", request.getOrderId());
        log.debug("Payment amount: {}", request.getAmount());

        try {
            PaymentResult result = gateway.charge(request);
            log.info("Payment successful, transaction: {}", result.getTransactionId());
            return result;
        } catch (PaymentGatewayException e) {
            log.error("Payment failed for order {}: {}", request.getOrderId(), e.getMessage(), e);
            throw e;
        }
    }
}
\`\`\`

\`\`\`properties
logging.level.root=INFO
logging.level.com.example=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.file.name=logs/application.log
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
\`\`\`

**Best practices:**
- Always use parameterized logging \`log.info("User: {}", name)\` not string concatenation
- Never log passwords, tokens, or card numbers
- Always include the exception object in \`log.error()\` for stack trace
- Use DEBUG and TRACE only — never INFO — for internal flow details

---

## 16. Testing

Spring Boot provides excellent testing support out of the box. Following the testing pyramid — many unit tests, some integration tests, few end-to-end tests — gives you fast feedback with reliable coverage.

### Unit Testing with Mockito

\`\`\`java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUserSuccessfully() {
        UserRequest request = new UserRequest("john", "pass", "john@example.com");
        User saved = new User(1L, "john", "encodedPass", "john@example.com");

        when(passwordEncoder.encode("pass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(saved);

        User result = userService.createUser(request);

        assertThat(result.getId()).isEqualTo(1L);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(99L))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
\`\`\`

### Controller Testing with MockMvc

\`\`\`java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturnUser() throws Exception {
        User user = new User(1L, "john", "john@example.com");
        when(userService.getById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("john"));
    }
}
\`\`\`

### Repository Testing with @DataJpaTest

\`\`\`java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void shouldFindByEmail() {
        entityManager.persist(new User(null, "john", "john@example.com"));
        entityManager.flush();

        Optional<User> found = userRepository.findByEmail("john@example.com");
        assertThat(found).isPresent();
    }
}
\`\`\`

**Testing annotations summary:**

| Annotation | Loads | Use For |
|---|---|---|
| @SpringBootTest | Full context | Integration tests |
| @WebMvcTest | Web layer only | Controller tests |
| @DataJpaTest | JPA layer only | Repository tests |
| @ExtendWith(MockitoExtension.class) | Nothing | Pure unit tests |

---

## 17. Spring Boot Actuator

Actuator exposes production-ready endpoints for health checks, metrics, and application info. It is essential for monitoring applications in production environments and integrates easily with tools like Prometheus and Grafana.

\`\`\`properties
management.endpoints.web.exposure.include=health,info,metrics,env,loggers
management.endpoint.health.show-details=always
info.app.name=My Application
info.app.version=1.0.0
\`\`\`

**Common Endpoints:**

| Endpoint | Description |
|---|---|
| /actuator/health | App and dependency health status |
| /actuator/info | App version and metadata |
| /actuator/metrics | JVM, CPU, request metrics |
| /actuator/env | All environment properties |
| /actuator/loggers | View and change log levels at runtime |
| /actuator/beans | All registered Spring beans |
| /actuator/mappings | All request mapping paths |
| /actuator/threaddump | Current thread states |

### 17.1 Production Topics (NEW)
Baseline production knowledge interviewers probe for at 2 YOE:

- **Connection Pool** — reusing a fixed set of DB connections instead of opening/closing one per request (expensive). **HikariCP** is Spring Boot's default connection pool — fast and lightweight.
  \`\`\`properties
  spring.datasource.hikari.maximum-pool-size=10
  spring.datasource.hikari.minimum-idle=5
  spring.datasource.hikari.connection-timeout=30000
  \`\`\`
- **Thread Pool / Tomcat Threads** — the embedded Tomcat server uses a thread pool to handle concurrent requests; each request occupies a thread until it completes.
  \`\`\`properties
  server.tomcat.threads.max=200
  server.tomcat.threads.min-spare=10
  \`\`\`
- Know that connection pool size and thread pool size need to be tuned together — if you have more concurrent requests needing DB access than available connections, requests queue up waiting for a connection even if there are free threads.

---

## 18. Spring Boot DevTools

Spring Boot DevTools enhances the development experience by providing automatic restarts, live reload, and development-time optimizations. It should never be used in production — it's strictly a development dependency.

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
\`\`\`

| Feature | What It Does | Developer Benefit |
|---|---|---|
| Automatic Restart | Restarts app when classpath files change | Instant feedback after code changes |
| LiveReload | Triggers browser refresh automatically | See UI changes immediately |
| Cache Disabling | Turns off template/thymeleaf caching | Templates update without restart |
| Property Defaults | Sets dev-friendly defaults | No manual config needed |
| Remote Debugging | Optional remote update support | Debug deployed apps |

---

## 19. Caching ⭐⭐⭐⭐⭐ (NEW)

Caching stores the result of expensive operations (database queries, API calls, computations) so repeated requests return instantly without re-executing the underlying logic. Spring Boot integrates with multiple cache providers through a unified abstraction layer.

\`\`\`java
@Configuration
@EnableCaching
public class CacheConfig { }
\`\`\`

**Core Caching Annotations:**

| Annotation | Behavior |
|---|---|
| @Cacheable | Returns cached result if exists, otherwise executes and caches |
| @CachePut | Always executes and updates the cache |
| @CacheEvict | Removes entry (or all entries) from cache |
| @Caching | Groups multiple cache annotations on one method |

\`\`\`java
@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id")
    public Product getById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @CachePut(value = "products", key = "#product.id")
    public Product update(Product product) {
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
\`\`\`

Cache providers:

| Provider | Best For | Dependency |
|---|---|---|
| ConcurrentHashMap | Dev/testing only | Built-in (default) |
| Caffeine | Single-instance apps, high performance | spring-boot-starter-cache + caffeine |
| Redis | Distributed apps, multiple instances | spring-boot-starter-data-redis |
| EhCache | JVM-local, rich config | ehcache |

\`\`\`properties
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.cache.redis.time-to-live=600000
\`\`\`

Best practices:
- Always set a TTL — unbounded caches grow until OutOfMemoryError
- Use Redis in any multi-instance deployment — in-memory caches are per-JVM and go out of sync
- Cache at the service layer, never the controller or repository layer
- Keep cached objects serializable
- Use @CacheEvict on every write operation that modifies cached data

---

## 20. API Documentation with Swagger / OpenAPI ⭐⭐⭐⭐⭐ (NEW)

Springdoc OpenAPI auto-generates interactive API documentation from your existing controller annotations. It requires zero extra configuration to get started.

\`\`\`xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
\`\`\`

- Swagger UI: \`http://localhost:8080/swagger-ui.html\`
- OpenAPI JSON: \`http://localhost:8080/v3/api-docs\`

\`\`\`java
requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
\`\`\`

---

## 21. Build and Deployment ⭐⭐⭐⭐⭐ (NEW)

Spring Boot packages the entire application — including the embedded server — into a single executable JAR. This makes deployment simple and consistent across all environments.

\`\`\`bash
# Maven
mvn clean package
mvn clean package -DskipTests

# Gradle
gradle clean build
gradle clean build -x test
\`\`\`

\`\`\`bash
java -jar target/app.jar
java -jar target/app.jar --spring.profiles.active=prod
java -jar target/app.jar --server.port=9090
java -Xmx512m -Xms256m -jar target/app.jar
\`\`\`

\`\`\`dockerfile
FROM openjdk:17-jdk-slim
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
\`\`\`

\`\`\`bash
docker build -t myapp .
docker run -p 8080:8080 -e DB_PASSWORD=secret myapp
\`\`\`

### 21.1 Spring Boot Version Changes: 2 → 3 (NEW)

The single biggest breaking change interviewers ask about:

- **javax.* → jakarta.*** — Spring Boot 3 moved to Jakarta EE 9+, so all \`javax.persistence.*\`, \`javax.validation.*\`, \`javax.servlet.*\` imports became \`jakarta.persistence.*\`, \`jakarta.validation.*\`, \`jakarta.servlet.*\`. This breaks every entity, DTO, and filter class on upgrade.
- Minimum Java version bumped from Java 8 to Java 17.
- Spring Framework 6 underneath, with native/GraalVM image support improvements (Spring Native).
- Third-party libraries had to release Jakarta-compatible versions — a common real-world upgrade pain point (e.g. old Lombok/MapStruct/JPA library versions breaking).

---

## Quick Reference — Most Used Annotations ⭐⭐⭐⭐⭐ (NEW)

| Annotation | Purpose |
|---|---|
| @SpringBootApplication | Bootstrap the application |
| @RestController | REST controller, returns JSON |
| @RequestMapping | Base URL mapping |
| @GetMapping / @PostMapping etc. | HTTP method mapping |
| @PathVariable | Extract from URL path |
| @RequestParam | Extract from query string |
| @RequestBody | Bind JSON body to object |
| @Valid | Trigger bean validation |
| @Service | Business logic bean |
| @Repository | Data access bean |
| @Component | Generic bean |
| @Autowired | Inject dependency |
| @Value | Inject config property |
| @ConfigurationProperties | Bind grouped config to a POJO |
| @Entity | JPA entity (maps to table) |
| @Transactional | Transaction boundary |
| @Version | Optimistic locking column |
| @Async | Run in separate thread |
| @Scheduled | Run on a schedule/cron |
| @Slf4j | Auto-generate logger |
| @RestControllerAdvice | Global exception handler |
| @ExceptionHandler | Handle specific exception |
| @Configuration | Bean definition class |
| @Bean | Register method return as bean |
| @Profile | Activate in specific profile |
| @Qualifier / @Primary | Resolve bean injection ambiguity |
| @PostConstruct / @PreDestroy | Bean lifecycle hooks |
| @DataJpaTest | Slice test for JPA layer |
| @WebMvcTest | Slice test for web layer |
| @MockBean | Spring-aware mock in tests |
`
  },
  {
    id: "react-nextjs",
    title: "React & Next.js Cheat Sheet",
    description: "Deep dive into React hooks, rendering strategies (SSR, SSG, ISR), server components, state management, and web performance optimization.",
    category: "Frontend Development",
    yoe: "Junior-Senior",
    readTime: "Coming Soon",
    icon: "react",
    isComingSoon: true,
    content: ""
  },
  {
    id: "nodejs-express",
    title: "Node.js & Express Cheat Sheet",
    description: "Asynchronous event loop, middleware patterns, authentication, clustering, database pooling, and performance monitoring.",
    category: "Backend Development",
    yoe: "Junior-Mid",
    readTime: "Coming Soon",
    icon: "node",
    isComingSoon: true,
    content: ""
  },
  {
    id: "fastapi-python",
    title: "FastAPI & Python Cheat Sheet",
    description: "Pydantic validation, dependency injection, async database connections, middleware, background tasks, and deployment.",
    category: "Backend Development",
    yoe: "Junior-Mid",
    readTime: "Coming Soon",
    icon: "python",
    isComingSoon: true,
    content: ""
  }
];
