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
    readTime: "30 min read",
    icon: "react",
    content: `# React + Next.js Complete Cheatsheet

> Written to actually revise from — every topic has a plain-English explanation of _why it exists and how it works_, not just a one-line definition, plus code examples. Updated for React 19 / Next.js 15+.

---

## Table of Contents

0.  Frontend Fundamentals
1.  JavaScript for React
2.  React Basics
3.  React Hooks
4.  Component Patterns
5.  State Management
6.  Performance Optimization
7.  Forms
8.  Routing
9.  Authentication
10. API Handling
11. Next.js
12. CSS
13. Testing
14. Accessibility
15. Security
16. Frontend System Design
17. Interview Questions
18. Project Architecture
19. Machine Coding
20. Best Practices

---

## 00. Frontend Fundamentals

### How the Browser Works

\`\`\`
User → Request → Server → HTML → Browser → DOM → CSSOM → Render Tree → Layout → Paint
\`\`\`

When you type a URL, the browser fetches raw HTML text and has to turn it into pixels on screen. It first parses the HTML top-to-bottom into the **DOM** — a tree of objects representing every tag. While doing that, whenever it hits a \`<link>\` or \`<style>\`, it parses the CSS into a separate tree called the **CSSOM**. Neither tree alone tells the browser what to actually draw — so it merges them into a **Render Tree**, which contains only the visible nodes with their final computed styles (a \`display: none\` element never makes it in here). Then it does **Layout** (a.k.a. reflow): walking the render tree and calculating the exact x/y position and width/height of every box. Finally it **Paints**: filling in actual pixels — text, colors, images, shadows.

This whole pipeline is called the **Critical Rendering Path**, and the reason performance engineers obsess over it is that every one of these steps blocks the next — a slow CSS file delays CSSOM, which delays Render Tree, which delays the very first thing the user sees.

**Why reflow is expensive but repaint isn't:** if you change something that affects geometry (width, font-size, adding an element), the browser has to redo Layout for that element _and potentially everything after it_ in the document, then repaint. But if you only change something purely visual (color, background), it skips Layout and jumps straight to Paint — much cheaper. Changing \`transform\` or \`opacity\` is cheaper still: it skips Layout _and_ Paint, going straight to **Composite** (the GPU just moves an already-painted layer around), which is exactly why smooth CSS animations use \`transform\`/\`opacity\` instead of animating \`top\`/\`left\`/\`width\`.

### The Event Loop

\`\`\`
Call Stack → Web APIs → Callback Queue (macrotasks) → Microtask Queue → Event Loop
\`\`\`

JavaScript is single-threaded — one call stack, one thing executing at a time. So how does \`setTimeout\` or \`fetch\` not freeze the page while waiting? They aren't actually handled by the JS engine at all — they're handed off to **Web APIs**, browser-provided machinery running outside your JS thread. When a timer finishes or a network response arrives, the callback you gave it doesn't just jump back onto the stack immediately; it gets placed into a queue, and the **Event Loop** is the mechanism that constantly checks "is the call stack empty? If yes, pull the next thing from a queue and push it onto the stack."

There are two queues, and this is the part that trips people up: the **microtask queue** (Promise \`.then\`, \`queueMicrotask\`) is _fully drained_ — every single microtask runs — before the event loop is allowed to pull even one task from the **macrotask queue** (\`setTimeout\`, UI events, I/O). That's why a \`Promise.resolve().then()\` always fires before a \`setTimeout(fn, 0)\`, even though both were "ready" at the same time.

\`\`\`js
console.log("1");
setTimeout(() => console.log("2"), 0); // macrotask — goes to the back of the line
Promise.resolve().then(() => console.log("3")); // microtask — jumps ahead of any macrotask
console.log("4");
// Output: 1, 4, 3, 2
\`\`\`

### Rendering Strategies (preview — full depth lives in the Next.js section)

\`\`\`
CSR:  Browser → JS → React → UI
SSR:  Server → HTML → Browser → Hydration
SSG:  Build time → Static HTML → CDN
ISR:  Static HTML + background regeneration on an interval
\`\`\`

The core tension here is: _where_ does the HTML get built, and _when_? In **CSR (Client-Side Rendering)**, the server sends an almost-empty HTML shell and a big JS bundle; the browser downloads and runs React to build the actual UI. This is simple to build but bad for SEO (crawlers may see a blank page) and slow on first load. In **SSR (Server-Side Rendering)**, the server runs your React code _for every request_ and sends back fully-formed HTML — great for SEO and fast first paint, but every request costs server compute. **SSG (Static Site Generation)** does the same HTML-building work, but only once, at build time — the result is a plain HTML file served instantly from a CDN, which is why blogs/docs use it. **ISR (Incremental Static Regeneration)** is the middle ground: serve the static file like SSG, but silently regenerate it in the background after a time window, so content stays fresh without paying the SSR-per-request cost.

**Hydration** is the step where React "wakes up" server-rendered HTML — it walks the existing DOM, attaches event listeners and internal state, without re-building the DOM from scratch (that would be wasteful since the HTML is already there and correct). **Streaming** takes this further: instead of waiting for the _entire_ page's data to be ready before sending any HTML, the server sends chunks as they become ready (using Suspense boundaries), so a slow section doesn't block the fast ones from appearing.

---

## 01. JavaScript for React

### Variables: var, let, const

\`var\` is function-scoped and gets **hoisted** — it's usable (as \`undefined\`) even before the line it's declared on, and you can redeclare it, which is exactly the kind of loose behavior that causes bugs in loops and closures. \`let\` and \`const\` fixed this by being **block-scoped** (confined to the nearest \`{}\`) and by living in a "Temporal Dead Zone" until their declaration line — accessing them earlier throws, instead of silently giving \`undefined\`. \`const\` additionally locks the _binding_ (you can't reassign the variable), but it does **not** deep-freeze the value — you can still mutate properties of a \`const\` object.

\`\`\`js
var x = 1; // avoid — function scope, hoisted, redeclarable
let y = 2; // block scope, reassignable
const z = 3; // block scope, binding is fixed, but z.prop = 4 still works if z is an object
\`\`\`

### Functions: declarations, arrows, IIFEs

Regular \`function\` declarations get their **own** \`this\` determined by _how they're called_ (not where they're written), and they're hoisted, so you can call one before its definition appears in the file. Arrow functions were introduced specifically to fix the "what is \`this\` inside a callback" headache — they don't create their own \`this\`, \`arguments\`, or \`super\`; they just inherit whatever \`this\` was in the surrounding scope when the function was _written_. This is exactly why arrow functions are the default choice for callbacks and class-field methods in React — you never lose track of \`this\`.

\`\`\`js
function greet() {} // own \`this\`, hoisted
const greet2 = () => {}; // lexical \`this\` — inherits from enclosing scope
(function () {
  console.log("runs immediately");
})(); // IIFE — used to create an isolated scope
\`\`\`

### Objects, Arrays, Destructuring, Spread/Rest

Destructuring lets you pull values out of objects/arrays by shape instead of writing \`user.name\` repeatedly — it reads almost like you're describing the data's structure. Spread (\`...\`) expands an iterable into individual elements (great for making copies or merging), while rest (also \`...\`, but on the _receiving_ side) does the opposite — it gathers "everything else" into one variable. The confusing part for beginners is that they use identical syntax but opposite directions of data flow.

\`\`\`js
const user = { name: "Ru", age: 25 };
const { name, ...rest } = user; // name = 'Ru', rest = { age: 25 }
const arr = [1, 2, 3];
const copy = [...arr, 4]; // [1, 2, 3, 4] — new array, original untouched
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
} // gathers all args into an array
\`\`\`

### Closures

A closure is what happens when an inner function "remembers" the variables from the scope it was created in, even after that outer function has already finished running. Normally you'd expect \`count\` to disappear once \`counter()\` returns — but because the returned arrow function still references it, JS keeps it alive in memory. This isn't a special feature you opt into; it's just how scope works in JS, but it becomes powerful once you realize this is _literally the mechanism_ behind \`useState\` — each component instance's state variables are kept alive between renders through closures over the fiber's memory cell.

\`\`\`js
function counter() {
  let count = 0;
  return () => ++count; // this inner function "closes over" count
}
const inc = counter();
inc();
inc(); // 2 — the same \`count\` persists across calls
\`\`\`

### Prototype/Inheritance & this/bind/call/apply

Every JS object has an internal link to another object called its **prototype**, and when you access a property that doesn't exist directly on the object, JS walks up this prototype chain looking for it — that's how \`array.map()\` works even though you never defined \`map\` on your specific array. \`this\` is trickier than in most languages because it's not fixed at write-time — it's determined by _how a function is called_. \`call\`/\`apply\` let you invoke a function immediately while explicitly choosing what \`this\` should be (they only differ in how you pass arguments — list vs array). \`bind\` doesn't invoke anything; it returns a **new function** permanently locked to a given \`this\`, which is useful when you're handing a callback off to something else (like an event listener) that will call it with the wrong \`this\` otherwise.

\`\`\`js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return \`\${this.name} makes a sound\`;
};

const fn = function () {
  return this.name;
};
fn.call({ name: "A" }); // 'A' — invoke now, this = {name:'A'}
fn.apply({ name: "A" }); // same, just different arg-passing style
const bound = fn.bind({ name: "A" }); // returns a new function, this permanently locked
\`\`\`

### Modules

Before ES Modules, every script shared one giant global scope — one library's \`utils\` variable could silently overwrite another's. Modules give each file its own private scope; nothing is visible outside it unless you explicitly \`export\` it, and other files must explicitly \`import\` what they need. This is what lets bundlers do tree-shaking (section 06) — since imports/exports are static and analyzable, the bundler can see exactly which exports are actually used and delete the rest.

\`\`\`js
export const add = (a, b) => a + b; // named export — import with matching name
export default function App() {} // default export — import under any name you like
import App, { add } from "./App";
\`\`\`

### Promises / Async-Await / Fetch

A Promise represents a value that isn't ready yet, but will be — either successfully (\`resolved\`) or with an error (\`rejected\`). \`async/await\` is just syntax sugar over Promises that lets asynchronous code _read_ like synchronous code (no \`.then()\` chains), while still being non-blocking under the hood — \`await\` pauses that function (not the whole thread) until the Promise settles.

\`\`\`js
async function getUser() {
  try {
    const res = await fetch("/api/user"); // pauses here without blocking the rest of the app
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch (e) {
    console.error(e); // fetch only rejects on network failure — you must check res.ok yourself for 4xx/5xx
  }
}
\`\`\`

### Generators & Iterators

A normal function runs to completion the moment you call it. A **generator** (\`function*\`) can pause itself mid-execution at every \`yield\`, handing control back to whoever called it, and resume exactly where it left off when \`.next()\` is called again. This is the underlying protocol that powers \`for...of\` loops, spreading, and async iteration — anything "iterable" in JS implements this same next()-returns-{value, done} shape.

\`\`\`js
function* gen() {
  yield 1;
  yield 2;
}
const it = gen();
it.next(); // { value: 1, done: false } — paused right after the first yield
\`\`\`

### Map/WeakMap/Set/WeakSet

\`Map\` and \`Set\` exist because plain objects are a clumsy way to do key-value storage — object keys are coerced to strings, and there's no clean \`.size\`. \`Map\` lets you use _any_ value (even objects/functions) as a key and preserves insertion order. The "Weak" variants only accept object keys, and crucially, they don't prevent garbage collection — if nothing else references that key object, it (and its entry) can be silently cleaned up. This makes \`WeakMap\` perfect for attaching "private" metadata to an object without causing a memory leak if that object is later discarded elsewhere in your app.

### Proxy & Reflect

A \`Proxy\` wraps an object and lets you intercept fundamental operations on it — reading a property, setting one, deleting one — and run your own logic instead. \`Reflect\` provides the matching default implementations of those operations, so inside your Proxy trap you can fall back to "just do the normal thing" without reimplementing it yourself.

\`\`\`js
const handler = {
  get(target, prop) {
    return Reflect.get(target, prop) ?? \`no \${prop}\`;
  },
};
const p = new Proxy({}, handler);
p.name; // "no name" — our custom get() trap ran instead of a plain property lookup
\`\`\`

This is genuinely the core trick behind Vue 3's reactivity system and libraries like Valtio (section 05) — instead of you calling \`setState()\`, they wrap your state object in a Proxy that detects \`state.count = 5\` directly and reacts to it.

### Debounce & Throttle

Both exist to stop a rapidly-firing event (typing, scrolling, resizing) from triggering your expensive callback hundreds of times per second. **Debounce** waits for a pause in activity — it keeps resetting a timer on every call, and only actually runs the function once the calls _stop_ for a given delay. That's why it's perfect for search-as-you-type: you don't want to hit the API on every keystroke, only once the user pauses. **Throttle** instead guarantees the function runs at most once per fixed interval, no matter how continuously the event fires — better for scroll/resize handlers where you want steady, periodic updates rather than a single final one.

\`\`\`js
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
\`\`\`

### Currying & Memoization

Currying transforms a function that takes multiple arguments into a chain of functions that each take one (or a few) — useful for building specialized versions of a function by partially filling in arguments ahead of time. Memoization is a caching strategy: if a pure function is called again with the exact same arguments, skip the recomputation and return the previously stored result — a straightforward but powerful optimization for expensive, repeatable calculations.

\`\`\`js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}
\`\`\`

### Event Delegation

Instead of attaching a click listener to every single \`<li>\` in a list (expensive, and broken for items added later), you attach **one** listener to their shared parent and inspect \`event.target\` to figure out which child was actually clicked. This works because of **event bubbling** — a click on a child element bubbles up through all its ancestors, so the parent gets a chance to react to it too.

\`\`\`js
document.getElementById("list").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") console.log(e.target.textContent);
});
\`\`\`

### Deep Copy vs Shallow Copy

Spreading (\`{...obj}\`) only copies the top level — if a property is itself an object, both the original and the copy point to the _same_ nested object, so mutating the nested part affects both. A deep copy recursively clones everything, so the two are completely independent. \`structuredClone\` is the modern built-in way to deep clone (handles Dates, Maps, circular references); the old \`JSON.parse(JSON.stringify(x))\` trick works but silently drops functions, \`undefined\`, and mangles \`Date\` objects into strings.

### Execution Context, Hoisting, Scope

Every time a function runs, JS creates an **execution context** for it — a little bundle containing its local variables, its scope chain (what outer variables it can see), and what \`this\` refers to. **Hoisting** is the (often misunderstood) behavior where \`var\` declarations and function declarations are processed _before_ the code actually runs line-by-line, effectively moving their declaration to the top of their scope — \`var\` gets initialized to \`undefined\` immediately, while \`let\`/\`const\` are hoisted too, but stay inaccessible ("Temporal Dead Zone") until their actual line executes.

### Memory & Garbage Collection

JS automatically frees memory using **mark-and-sweep**: periodically, the engine starts from "roots" (global object, currently-executing functions) and marks every object reachable from them; anything left unmarked is considered garbage and gets swept away. The practical danger in React apps is accidentally keeping something "reachable" forever without meaning to — an interval you never \`clearInterval\`'d, an event listener you never removed in a \`useEffect\` cleanup, or a closure capturing a huge object that never gets released. None of these are "leaks" in the C++ sense — they're just objects the GC isn't allowed to touch because your code still technically references them.

### 🆕 Signals / Signals Proposal

For years, reactivity in JS frameworks meant "something changed → re-render a whole component → diff the virtual DOM → figure out what actually needs updating." Signals flip that: a **signal** is a container holding a value that _knows_ what's reading it, so when it changes, it can update _exactly_ the piece of the DOM (or computation) that depends on it — no diffing, no re-rendering an entire component tree. This idea proved so useful (Preact, Vue, Solid, Qwik, Angular all converged on some version of it independently) that TC39 now has a **Signals Proposal** aiming to standardize the core primitive directly in the JS language itself, so every framework can build on the same foundation instead of reinventing it.

\`\`\`js
// Conceptual shape of the proposal
const count = new Signal.State(0);
const double = new Signal.Computed(() => count.get() * 2); // auto-recomputes when count changes
count.set(count.get() + 1);
\`\`\`

### 🆕 Temporal API

\`Date\` has been a source of pain since JS's earliest days: it's mutable (any function you pass it to can silently change it), its parsing behavior is inconsistent across engines, and it has essentially no real timezone support — which is why almost every serious app reaches for \`date-fns\`, \`dayjs\`, or \`moment\`. \`Temporal\` is the long-awaited native replacement: it splits "a date" into precise, purpose-built, **immutable** types — \`PlainDate\` (just a calendar date, no time/zone), \`PlainTime\`, \`ZonedDateTime\` (a real instant tied to a timezone), and \`Duration\` — so you're never confused about what kind of "time thing" you're holding.

\`\`\`js
const date = Temporal.PlainDate.from("2026-07-06");
const later = date.add({ days: 10 }); // returns a new PlainDate — the original is untouched
date.until(later).days; // 10 — accurate calendar math built in, no library needed
\`\`\`

---

## 02. React Basics

### JSX

JSX looks like HTML mixed into JavaScript, but it isn't a special browser feature — it's syntactic sugar that a compiler (Babel/SWC) transforms into plain function calls before your code ever runs. \`<h1>Hello</h1>\` literally becomes a function call that returns a plain JS object describing "an h1 with this text" — React then reads that object to figure out what to put in the DOM. Understanding this demystifies a lot of "magic": conditionals, loops, and expressions work inside \`{}\` because it's just JavaScript underneath.

\`\`\`jsx
const element = <h1>Hello</h1>; // compiles to something like jsx('h1', { children: 'Hello' })
\`\`\`

### Components, Props, Children

A component is just a function that returns a description of UI — React calls it, gets back JSX, and figures out what DOM to produce. **Props** are how a parent passes data down into that function — they're read-only from the child's perspective (a component should never reassign its own props); if a component wants to change what it renders based on user interaction, it does that with **state**, not by mutating props. \`children\` is simply the special prop React populates automatically whenever you nest content between a component's opening and closing tags — a pattern that lets you build genuinely reusable "wrapper" components like \`Card\` or \`Modal\` without them needing to know anything about what's inside them.

\`\`\`jsx
function Button({ title }) {
  return <button>{title}</button>;
}
<Button title="Save" />;

function Card({ children }) {
  return <div className="card">{children}</div>;
}
<Card>
  <Text />
</Card>;
\`\`\`

### Conditional Rendering

Because JSX is just JavaScript, "conditional rendering" isn't a special React feature — it's just using normal JS conditionals inside \`{}\`. \`&&\` is a shorthand for "render this only if the condition is true" (careful: if the left side is \`0\`, React will literally render the number 0 — a classic gotcha), and the ternary is used when you need an actual either/or.

\`\`\`jsx
{
  isAdmin && <AdminPanel />;
}
{
  isLoggedIn ? <Dashboard /> : <Login />;
}
\`\`\`

### Lists & Keys

When you render an array with \`.map()\`, React needs a stable way to tell "this item in the new render" apart from "this item in the old render" so it knows whether to update, move, or destroy/recreate a DOM node. That's what \`key\` is for — it's not really about rendering the list correctly the first time (that works fine without keys), it's about correctly matching elements across re-renders when the list changes. Using the array **index** as a key seems to work until items get reordered, inserted, or removed — then React matches the wrong old DOM node to the wrong new item, which can cause visually correct-looking but actually-wrong-state bugs (like a text input "remembering" the previous row's typed value after a reorder).

\`\`\`jsx
{
  items.map((item) => <li key={item.id}>{item.name}</li>);
} // ✅ stable identity across renders
{
  items.map((item, i) => <li key={i}>{item.name}</li>);
} // ❌ breaks if list order changes
\`\`\`

### Fragments

Every component must return a single root element — but sometimes you don't actually want an extra wrapping \`<div>\` in the real DOM (it can break CSS layouts relying on direct-child selectors, or invalidate semantic HTML like a \`<table>\` expecting only \`<tr>\` children). A Fragment (\`<>...</>\`) satisfies React's "single root" requirement without adding any actual node to the DOM.

### Controlled vs Uncontrolled Components

In a **controlled** component, React state is the single source of truth for the input's value — you must update state in \`onChange\` for anything to visibly change, since the \`value\` prop always wins. This gives you full control (validate/transform on every keystroke) at the cost of a re-render per keystroke. An **uncontrolled** component lets the DOM itself hold the current value, and you only reach in and read it when you need to (via a \`ref\`) — simpler and faster for cases where you don't need to react to every change.

\`\`\`jsx
<input value={val} onChange={e => setVal(e.target.value)} /> // controlled
<input ref={inputRef} defaultValue="hi" />                    // uncontrolled
\`\`\`

### Lifting State Up, Composition, Prop Drilling

If two sibling components need to share or stay in sync on some piece of state, neither of them can "own" it individually — the fix is to move (**lift**) that state up to their closest common parent, which then passes it down as props to both. **Composition** is React's answer to "how do I share behavior without deep inheritance chains" — instead of a \`SpecialButton extends Button extends BaseButton\`, you build flexible components by nesting/passing components as props (\`children\`, or named slot props). **Prop drilling** is the pain point that shows up once your component tree gets deep: passing a prop through five layers of components that don't even use it, just to get it to the sixth — which is the practical reason Context (and later, state libraries) exist.

---

## 03. React Hooks

### useState

\`\`\`
state → setState → Re-render
\`\`\`

\`useState\` gives a function component something it otherwise couldn't have: a value that survives between renders. Each render of a component is really just calling that function again from scratch — normal local variables would reset every time — but React stores the state value _outside_ the function call, in the component's internal "fiber," and hands it back to you on each render along with a setter that tells React "something changed, please re-render this component."

Two subtleties matter here. First, calling \`setState\` doesn't change the variable immediately in the current render — the current \`count\` you're holding is a snapshot; the update only shows up on the _next_ render. Second, React **batches** multiple \`setState\` calls that happen within the same event/tick into a single re-render for efficiency (and since React 18, this batching applies almost everywhere — timeouts, promises, native event handlers — not just inside React's own event handlers like it used to). Because of batching, if you need to update state based on its _previous_ value, use the functional form (\`setCount(c => c + 1)\`) rather than referencing the possibly-stale \`count\` variable directly — this avoids bugs where multiple rapid updates only "count" as one.

\`\`\`jsx
const [count, setCount] = useState(0);
setCount((c) => c + 1); // safe even if called multiple times before a re-render happens
\`\`\`

### useEffect

\`\`\`
Mount → Update → Unmount
\`\`\`

Rendering in React is supposed to be a pure calculation: given props/state, produce JSX — no side effects (network calls, subscriptions, manually touching the DOM) allowed during that phase. \`useEffect\` is the escape hatch: it lets you run code _after_ React has committed the render to the DOM, specifically for things that reach outside React (fetching data, setting up a subscription, manipulating a non-React widget). The dependency array tells React "only re-run this effect if one of these values changed since last render" — leave it off entirely and it runs after every single render (usually not what you want); leave it empty and it only runs once, right after the first render.

The **cleanup function** (the function you \`return\` from inside the effect) runs right before the effect runs again, and also on unmount — it exists so that anything you "set up" (a timer, a subscription, an event listener) gets properly "torn down," otherwise you accumulate duplicate timers/listeners every time the effect re-runs.

\`\`\`jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // runs before the next effect, and on unmount
}, [dep]);
\`\`\`

**Common mistakes:** forgetting the dependency array (runs every render — often causing infinite loops if the effect itself sets state that's in its own dependencies); putting a freshly-created object/array/function literal in the dependency array (it's a _new reference_ every render, so React thinks it "changed" every time even if the contents look identical); forgetting cleanup, which quietly leaks memory/duplicated subscriptions over time.

### useRef

A \`ref\` gives you a mutable box (\`{ current: ... }\`) that persists across renders _without_ causing a re-render when you change it — the opposite trade-off from state, which persists but _does_ trigger re-renders. This makes it perfect for two very different jobs: holding a direct reference to a real DOM node (so you can call \`.focus()\` or measure it), and holding any value you want to remember across renders but that has no business influencing what gets rendered (a previous value, a timer ID, a render count for debugging).

\`\`\`jsx
const inputRef = useRef(null);
useEffect(() => inputRef.current.focus(), []);
\`\`\`

### useMemo, useCallback, React.memo

All three exist purely to skip unnecessary work, and they solve three different flavors of the same underlying problem: React re-runs your whole component function on every render, which means every expensive calculation, every function definition, and every child render happens again by default — even if nothing relevant actually changed. \`useMemo\` caches the **result of a calculation** between renders, recomputing only if a dependency changed. \`useCallback\` caches a **function's reference** itself (not its result) — useful because passing a brand-new function to a memoized child every render would defeat that child's memoization (new reference = "props changed" as far as \`React.memo\`'s shallow comparison is concerned). \`React.memo\` wraps a whole component and tells React "skip re-rendering this if the props are shallow-equal to last time."

\`\`\`jsx
const sorted = useMemo(() => expensiveSort(list), [list]);
const handleClick = useCallback(() => doThing(id), [id]);
const Memoized = React.memo(Child);
\`\`\`

### useReducer

\`\`\`
dispatch → reducer → new state
\`\`\`

\`useState\` gets awkward once your state update logic itself gets complicated — many related fields, or updates that depend on multiple pieces of previous state at once. \`useReducer\` centralizes "how state changes" into one pure function (the reducer) that takes the current state plus an "action" describing _what happened_, and returns the new state — you never mutate state directly, you \`dispatch\` an action describing intent, and let the reducer decide the resulting shape. This is the same mental model Redux is built on, just scoped to one component/hook instead of the whole app.

\`\`\`jsx
function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { count: state.count + 1 };
    default:
      return state;
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0 });
\`\`\`

### Context API

Props naturally flow one direction: parent to child. Context exists for the case where a value (theme, logged-in user, locale) is needed by many components at very different depths, and manually threading it through every intermediate component (prop drilling) would be absurd. A \`Provider\` makes a value available to its entire subtree, and any descendant can read it directly with \`useContext\` — skipping every layer in between. The trade-off: any component consuming a context re-renders whenever that context's value changes, so Context is best for values that change infrequently (theme, auth) rather than something like "current mouse position."

\`\`\`jsx
const ThemeContext = createContext("light");
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>;
const theme = useContext(ThemeContext);
\`\`\`

### Custom Hooks

A custom hook is just a regular function that happens to call other hooks inside it, named with a \`use\` prefix by convention so React (and linters) know it follows the Rules of Hooks. Their entire purpose is extracting reusable **stateful logic** out of components — if you find yourself copy-pasting the same \`useState\` + \`useEffect\` combo across multiple components, that's the signal to pull it into a custom hook instead.

\`\`\`jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}
\`\`\`

### useLayoutEffect vs useEffect

Both look identical, but timing is the whole story: \`useEffect\` runs _after_ the browser has painted the screen, so if your effect changes something visually, the user briefly sees the "before" state flash before it updates. \`useLayoutEffect\` runs synchronously _before_ the browser paints — React waits for it to finish before showing anything — which is exactly what you want for DOM measurements that then affect layout (e.g., measuring an element's height to position a tooltip), so there's no visible flicker. The trade-off is that \`useLayoutEffect\` blocks painting, so overusing it can make your app feel less responsive.

### useImperativeHandle

Normally, a parent can't reach "into" a child component and call methods on it — data flows down via props, not imperative method calls. \`useImperativeHandle\` (paired with \`forwardRef\`) is the deliberate escape hatch for the rare cases you actually need that — like exposing a \`.focus()\` or \`.scrollIntoView()\` method on a custom input component to a parent holding its ref.

\`\`\`jsx
const Input = forwardRef((props, ref) => {
  const localRef = useRef();
  useImperativeHandle(ref, () => ({ focus: () => localRef.current.focus() }));
  return <input ref={localRef} />;
});
\`\`\`

### useTransition & useDeferredValue

Both exist to solve the same UX problem: a state update that's expensive to render (like re-filtering a huge list on every keystroke) can make the whole UI feel laggy, because React normally treats every update as equally urgent. \`useTransition\` lets you explicitly mark an update as **low priority/interruptible** — React will still keep the input itself feeling instant, and will render the expensive part in the background, throwing it away and restarting if a newer update comes in first. \`useDeferredValue\` is a slightly different angle on the same idea: instead of marking the _update_ as low priority, you get a "lagging behind" copy of a fast-changing value, letting you render the expensive part against the deferred (slightly stale) value while the input itself stays instantly responsive.

\`\`\`jsx
const [isPending, startTransition] = useTransition();
startTransition(() => setFilter(input));

const deferredQuery = useDeferredValue(query);
\`\`\`

### useId & useSyncExternalStore

\`useId\` generates a unique, stable ID string per component instance — the reason it exists rather than just using \`Math.random()\` yourself is SSR: server and client need to generate the _exact same_ ID for hydration to match up correctly, and \`useId\` guarantees that. \`useSyncExternalStore\` is the official, safe way to read state that lives **outside** React entirely (a browser API, a third-party store) — reading external state naively can cause subtle tearing bugs under React's concurrent rendering; this hook is the primitive that libraries like Redux/Zustand now use internally to subscribe safely.

### 🆕 React 19: useActionState (formerly useFormState)

Before this hook, wiring up a form that calls a server, shows a pending spinner, and displays a result/error required manually juggling \`useState\` for the result, \`useState\` for a loading flag, and an \`onSubmit\` handler with try/catch — all repeated for every form. \`useActionState\` bundles all three concerns into one hook tied directly to a form's \`action\`: you give it an async function (which receives the previous state and the submitted \`FormData\`), and it gives you back the latest returned state plus a \`pending\` flag, automatically kept in sync with the form submission lifecycle.

\`\`\`jsx
function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return { error: "Failed to send" };
      return { success: true };
    },
    { success: false },
  );

  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>{isPending ? "Sending..." : "Send"}</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
\`\`\`

### 🆕 React 19: useFormStatus

A submit button is often a separate, reusable component nested deep inside a \`<form>\` — but it needs to know "is the parent form currently submitting?" to disable itself or show a spinner. Before this hook, that meant passing an \`isPending\` prop down manually (prop drilling, again). \`useFormStatus\` lets any component rendered _inside_ a \`<form>\` read that form's pending/submitted-data status directly, with zero props passed — it only works when called from a descendant of the form, not the form's own component.

\`\`\`jsx
function SubmitButton() {
  const { pending } = useFormStatus(); // reads the ancestor <form>'s status directly
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
function Form() {
  return (
    <form action={saveAction}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
\`\`\`

### 🆕 React 19: use API

\`use\` isn't technically a hook (it can be called conditionally or inside loops, which normal hooks can't), and it solves two problems at once. First, reading a **Promise**: instead of manually juggling \`useEffect\` + \`useState\` to fetch data and track loading, you can pass a Promise straight into \`use()\`, and it "suspends" the component (pausing rendering, showing the nearest Suspense fallback) until the Promise resolves — no boilerplate state needed. Second, reading **Context conditionally**, which \`useContext\` never allowed because hooks must run unconditionally on every render — \`use(SomeContext)\` can safely sit inside an \`if\` block.

\`\`\`jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // suspends until resolved, no useEffect needed
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}
function Banner({ show }) {
  if (!show) return null;
  const theme = use(ThemeContext); // ✅ conditional — not allowed with useContext
  return <div className={theme}>Banner</div>;
}
\`\`\`

---

## 04. Component Patterns

**Container/Presentational** was an early convention for separating "what data does this need and how do I get it" (container) from "how does this look" (presentational, pure props-in JSX-out). Hooks have largely absorbed this — a custom hook now plays the role the container component used to — but the underlying idea (separate data concerns from rendering concerns) is still worth applying.

**Compound Components** let a parent and its children implicitly share state/behavior without you manually wiring props between them — internally, the parent typically sets up a Context provider, and each child (like \`Select.Option\`) reads from it, so from the outside it just looks like natural, readable nesting.

\`\`\`jsx
<Select>
  <Select.Option value="a">A</Select.Option>
  <Select.Option value="b">B</Select.Option>
</Select>
\`\`\`

**Render Props** is an older pattern for sharing logic: instead of a component deciding what to render itself, it accepts a function as a prop and calls it with whatever data/state it manages, letting the _caller_ decide the actual markup. Hooks have replaced most use cases for this (a custom hook is usually simpler than a render-prop wrapper), but you'll still see it in some libraries.

\`\`\`jsx
<DataFetcher render={(data) => <List data={data} />} />
\`\`\`

**HOC (Higher-Order Component)** is a function that takes a component and returns a new, enhanced component — a way to reuse cross-cutting logic (like "require auth before rendering this") across many components without repeating the logic in each one.

\`\`\`jsx
function withAuth(Component) {
  return function Wrapped(props) {
    const user = useAuth();
    return user ? <Component {...props} /> : <Login />;
  };
}
\`\`\`

**Headless Components** provide all the _behavior_ and accessibility wiring (keyboard nav, ARIA attributes, open/close state) with zero visual opinion — you supply 100% of the markup/styling yourself. This has become popular (Radix UI, Downshift, TanStack Table) because it separates "hard to get right" (accessible interaction logic) from "highly variable per-project" (visual design), letting you reuse the former without inheriting someone else's design system.

**Polymorphic Components** let you change the underlying rendered HTML tag while keeping the same component's styling/behavior — e.g. a \`Button\` that can render as an actual \`<a>\` tag when it needs to behave like a link, without duplicating the styling logic in two separate components.

\`\`\`jsx
<Button as="a" href="/home">
  Home
</Button>
\`\`\`

**Slot Pattern** generalizes \`children\` into multiple _named_ insertion points (\`header\`, \`footer\`, \`sidebar\` props that are themselves JSX) — useful when a component's layout has more than one distinct "hole" that the caller needs to fill independently.

---

## 05. State Management

### When is useState/useReducer Enough?

Not everything needs a state library. If a piece of state is only relevant to one component (or naturally lifted to its direct parent) — a toggle, a form field's value, whether a modal is open — plain \`useState\`/\`useReducer\` is simpler, has zero extra dependencies, and is easier to reason about than routing it through a global store.

### The Landscape

| Library                      | Type                       | Best for                                                        |
| ---------------------------- | -------------------------- | --------------------------------------------------------------- |
| Context                      | Built-in                   | Low-frequency updates (theme, auth user)                        |
| Redux Toolkit                | Flux/reducer               | Large apps needing strict predictability + devtools/time-travel |
| Zustand                      | Minimal store              | Small-medium apps wanting a simple API with less boilerplate    |
| Jotai                        | Atomic                     | Fine-grained state built bottom-up from small atoms             |
| MobX                         | Observable                 | OOP-style code with automatic reactivity                        |
| Recoil                       | Atomic (Meta)              | Similar to Jotai, less actively maintained now                  |
| React Query / TanStack Query | Server cache               | Caching/refetching/syncing _remote_ async data                  |
| RTK Query                    | Server cache (Redux-based) | Same job as React Query, inside the Redux ecosystem             |

The reason this list looks so crowded is that "state management" actually covers at least two very different problems people used to lump together: **client UI state** (is this dropdown open, what's in this form) and **server cache state** (data that actually lives in a database somewhere and you're just holding a synced copy of). Redux/Zustand/Jotai are built for the former; React Query/RTK Query are purpose-built for the latter, handling things Redux was never designed for out of the box — automatic refetching, stale-while-revalidate caching, request deduplication.

### 🆕 Signals-Based Libraries

Both **Preact Signals** and **Valtio** take a fundamentally different approach from "call setState, trigger a re-render, diff the tree": they track dependencies at the _property_ level, so updating one field only notifies the specific pieces of UI that actually read that field — skipping the virtual DOM diff step for that update entirely. Valtio specifically wraps a plain object in a JS \`Proxy\` (see section 01), so you write completely ordinary-looking mutations (\`state.count++\`) and it detects the change automatically; \`useSnapshot\` gives your component a reactive, read-only snapshot that only triggers a re-render on properties your component actually accessed.

\`\`\`jsx
import { proxy, useSnapshot } from "valtio";
const state = proxy({ count: 0 });
function Counter() {
  const snap = useSnapshot(state);
  return <button onClick={() => state.count++}>{snap.count}</button>;
}
\`\`\`

### Decision Tree (Updated for RSC)

\`\`\`
Need server cache?
│
├── Yes → React Query / RTK Query
│         (or Next.js Server Components / Server Actions —
│          native \`fetch\` caching + revalidation often replaces
│          React Query entirely in a Next.js app)
│
└── No
    └── Context (low-frequency) → Redux/Zustand (complex/global client state)
\`\`\`

The big shift in 2025-2026 thinking: **React Server Components fetch data on the server and stream the _result_ down as already-rendered UI** — there's no client-side cache to manage because the client never held the raw data to begin with. That means, in a Next.js App Router project, a large share of what used to justify pulling in Redux or Zustand (just to store and share fetched API data across components) simply isn't needed anymore — the server did the fetching, and Next's own \`fetch\` caching/\`revalidatePath\` handles freshness. Client state libraries are increasingly reserved for what's genuinely client-only and interactive (an open modal, a multi-step wizard's current step, drag state) rather than as a parking lot for server data.

## 06. Performance Optimization

**React.memo** exists because, by default, a child component re-renders every time its parent re-renders, _even if the child's own props didn't change_. Wrapping it in \`React.memo\` tells React to shallow-compare the new props against the old ones first, and skip re-rendering entirely if they're the same — worthwhile for components that render often but rarely receive genuinely new data.

\`\`\`jsx
const Row = React.memo(function Row({ item }) {
  return <li>{item.name}</li>;
});
\`\`\`

**Code Splitting, Lazy Loading, Suspense** tackle a different problem: bundle size. Shipping your entire app as one JS file means users download code for pages they may never visit. \`React.lazy\` + dynamic \`import()\` split a component into its own chunk, only fetched when it's actually needed; \`Suspense\` provides the fallback UI to show while that chunk is downloading.

\`\`\`jsx
const Settings = React.lazy(() => import("./Settings"));
<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>;
\`\`\`

**Dynamic Import** is the same idea outside of React components — deferring the download of a whole module until the moment it's actually used, e.g. only loading a heavy charting library once the user clicks "show chart."

\`\`\`js
button.addEventListener("click", async () => {
  const { heavyFn } = await import("./heavyModule.js");
  heavyFn();
});
\`\`\`

**Windowing / Virtualization** solves the "list with 10,000 rows" problem: rendering all 10,000 DOM nodes would be catastrophically slow and mostly wasted, since only ~20 are visible in the viewport at once. Libraries like \`react-window\` render only the visible slice (plus a small buffer) and recycle DOM nodes as you scroll, keeping performance constant regardless of list size.

**Image Optimization** matters because images are usually the heaviest assets on a page. The core techniques are: serving appropriately-sized images per device (\`srcset\`), using modern compressed formats (WebP/AVIF instead of PNG/JPEG), and lazy-loading images below the fold so they don't compete with above-the-fold content for bandwidth. Next.js's \`<Image>\` component automates all three.

**Tree Shaking & Bundle Splitting** happen at build time: because ES Modules declare imports/exports statically (see section 01), a bundler can trace exactly which exports are actually used anywhere in your app and delete ("shake out") the rest from the final bundle. Bundle splitting is the complementary idea of breaking the _used_ code into multiple files, so a user only downloads what a given page needs instead of one giant bundle.

**Profiler, Lighthouse, Web Vitals** are how you actually _measure_ whether any of the above helped, rather than guessing. The **React Profiler** (a DevTools tab) shows how long each component took to render per commit — invaluable for finding which specific component is the bottleneck. **Lighthouse** runs an automated audit covering performance, accessibility, SEO, and best practices, producing a score plus concrete suggestions. **Core Web Vitals** are Google's three headline real-world metrics: **LCP** (how long until the largest visible element renders — a loading metric), **INP** (how long the page takes to respond to a user interaction — replaced FID in 2024 as the responsiveness metric), and **CLS** (how much visible content unexpectedly shifts around — a visual-stability metric, usually caused by images/ads loading without reserved space).

### 🆕 React Compiler (React Forget)

For years, avoiding unnecessary re-renders meant manually sprinkling \`useMemo\`/\`useCallback\`/\`React.memo\` throughout your code — and doing it _correctly_ (right dependency arrays, not over- or under-memoizing) was genuinely hard to get consistently right, even for experienced React developers. The React Compiler, released alongside React 19, is a **build-time tool** that statically analyzes your component code and automatically inserts the equivalent of memoization wherever it can prove doing so is safe — meaning you can write plain, un-memoized code and still get most of the performance benefit.

\`\`\`jsx
// Before (manual memoization)
const total = useMemo(() => items.reduce((a, b) => a + b.price, 0), [items]);
const handleClick = useCallback(() => onSelect(id), [id]);

// After React Compiler — write plain code, compiler inserts memoization at build time
const total = items.reduce((a, b) => a + b.price, 0);
const handleClick = () => onSelect(id);
\`\`\`

It's important to understand _why_ the compiler can't replace manual memoization 100% of the time: it only optimizes code that provably follows the **Rules of React** (pure rendering, no side effects during render) — anything it can't statically prove safe, it leaves alone. So you still reach for manual \`useMemo\`/\`useCallback\` when: a value comes from outside React and the compiler can't trace its stability, the calculation involves non-deterministic logic, or you're working in a codebase/library where compiler adoption is partial. It also doesn't touch virtualization, code-splitting, or effect-related performance — it purely removes the _re-render memoization_ boilerplate, not every performance concern in section 06.

---

## 07. Forms

**Controlled Forms** put React state in charge of every field's value — necessary if you need to validate/transform on every keystroke, but it means a re-render fires on every character typed.

\`\`\`jsx
const [email, setEmail] = useState("");
<input value={email} onChange={(e) => setEmail(e.target.value)} />;
\`\`\`

**React Hook Form** takes a different approach: fields stay _uncontrolled_ by default (the DOM holds the value, not React state), and the library only reads values when needed (on submit, or on-demand validation) — this avoids a re-render per keystroke, which is why it noticeably outperforms controlled-everything forms on large/complex forms.

\`\`\`jsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email", { required: true })} />
  {errors.email && <span>Required</span>}
</form>;
\`\`\`

**Formik** solves the same problem as React Hook Form but predates it and leans more on controlled inputs internally, which is part of why it re-renders more and has fallen out of favor for new projects — still common in older codebases though.

**Validation — Yup vs Zod**: both let you declare a data shape once and validate against it, instead of writing ad-hoc \`if\` checks scattered through your form logic. Zod has become the more popular default in TypeScript projects specifically because it infers a matching TypeScript type directly from the schema — you define validation once and get type-safety for free, without keeping a separate interface in sync.

\`\`\`js
import { z } from "zod";
const schema = z.object({ email: z.string().email(), age: z.number().min(18) });
schema.parse(formData); // throws if formData doesn't match the shape
\`\`\`

**File Upload / Drag & Drop**: file inputs are inherently uncontrolled (browsers won't let JS set a \`<input type="file">\`'s value for security reasons), so you always read the selected file(s) from the event/ref rather than driving it with state. Drag-and-drop is built on the browser's native \`dragover\`/\`drop\` events — you must call \`preventDefault()\` on \`dragover\`, or the browser's default "reject the drop" behavior takes over and \`drop\` never fires.

\`\`\`jsx
<input type="file" onChange={e => setFile(e.target.files[0])} />
<div onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
     onDragOver={e => e.preventDefault()}>
  Drop files here
</div>
\`\`\`

---

## 08. Routing

**React Router** solves a fundamental SPA problem: once you've moved away from full page reloads for navigation, _something_ needs to sync the URL with what's on screen, handle back/forward buttons, and let you deep-link into a specific view. It does this by intercepting navigation, matching the current URL against a route tree, and rendering the matched component — all without a real page reload.

\`\`\`jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/user/:id" element={<UserDetail />} />{" "}
    {/* :id becomes a URL param you read via useParams() */}
    <Route path="*" element={<NotFound />} />{" "}
    {/* catch-all for unmatched paths */}
  </Routes>
</BrowserRouter>
\`\`\`

**Nested Routes** mirror how UIs actually nest: a dashboard layout with its own persistent header/sidebar, inside which different sub-pages swap in and out. Rather than re-rendering the whole layout for every sub-page, nested routes let a parent route render its shared UI once, with an \`<Outlet/>\` marking where the matched child route's content goes.

\`\`\`jsx
<Route path="dashboard" element={<Dashboard />}>
  <Route path="settings" element={<Settings />} />{" "}
  {/* renders inside Dashboard's <Outlet/> */}
</Route>
\`\`\`

**Protected Routes** are how you gate access without a real backend redirect — a wrapper component checks auth state _before_ rendering the actual protected content, and renders a \`<Navigate>\` (client-side redirect) to the login page instead if the check fails.

\`\`\`jsx
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
\`\`\`

**Lazy Routes** combine routing with code-splitting (section 06) — there's no reason to download the JS for \`/dashboard\` if the user is currently sitting on \`/\`, so the route's component is only fetched once that route is actually navigated to.

\`\`\`jsx
const Dashboard = lazy(() => import("./Dashboard"));
<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>;
\`\`\`

---

## 09. Authentication

**JWT (JSON Web Token)** exists to make authentication **stateless** — instead of the server keeping a database of active sessions and looking one up on every request, it issues a signed token containing the user's identity/claims. Any server holding the signing secret can verify the token wasn't tampered with, without needing to check a database at all. Note "signed" doesn't mean "encrypted" — anyone can decode a JWT's payload and read it; the signature only proves it wasn't altered, so JWTs should never carry secret data (see section 15).

**Access Token vs Refresh Token** exists to balance security against convenience. If you only had one long-lived token, a stolen token would grant access indefinitely; if you only had short-lived tokens, users would need to re-login every few minutes. The compromise: a short-lived **access token** (minutes) is what actually authorizes API calls, while a long-lived **refresh token** is used only to silently mint new access tokens when the old one expires — so a stolen access token has a small blast radius. **Refresh token rotation** goes a step further: every time a refresh token is used, the server issues a brand-new one and invalidates the old one, so if an attacker ever manages to reuse a stolen refresh token, the legitimate user's _next_ refresh attempt will immediately fail and reveal the theft.

**Cookies/Session vs OAuth**: a traditional session keeps the actual user data on the server, giving the client only an opaque session ID — this makes revoking access trivial (just delete the server-side session) at the cost of needing a shared session store (Redis/DB) across your servers. **OAuth** solves a different problem entirely: letting a user log in via a third party (Google, GitHub) without your app ever seeing their password — your app receives a token proving "this third party vouches this is who they say they are."

**Storage: Cookie vs LocalStorage vs SessionStorage** — this table matters because where you store a token directly determines your attack surface:

|                     | Sent to server automatically | Survives tab close | XSS exposure                                 | CSRF exposure                          |
| ------------------- | ---------------------------- | ------------------ | -------------------------------------------- | -------------------------------------- |
| Cookie (\`httpOnly\`) | Yes                          | Depends on expiry  | Safe — JS can't read it at all               | Vulnerable — needs CSRF token/SameSite |
| LocalStorage        | No                           | Yes                | Vulnerable — any injected script can read it | Safe                                   |
| SessionStorage      | No                           | No (per tab)       | Vulnerable                                   | Safe                                   |

The practical takeaway: an \`httpOnly\` cookie can't be stolen by a malicious script (XSS) since JavaScript literally cannot read it, but it _is_ automatically attached to every request to that domain, which is what opens the door to CSRF (needing \`SameSite\`/CSRF-token protection instead). \`localStorage\` is the reverse trade-off. This is exactly why the recommended practice is \`httpOnly\`, \`Secure\`, \`SameSite\` cookies for auth tokens, never \`localStorage\` — XSS is generally considered the more dangerous, harder-to-fully-prevent class of vulnerability.

### 🆕 BFF (Backend-for-Frontend) Pattern

The problem this solves: if your Next.js client component holds a raw JWT (even briefly, in memory or a client-readable cookie) to call your APIs directly, that token is exposed to any XSS vulnerability in your frontend. The BFF pattern adds a thin server-side layer — in Next.js, this is Middleware + Route Handlers, both of which run only on the server, never shipped to the browser — that sits between the browser and your real backend APIs. The browser only ever holds an opaque, \`httpOnly\` session cookie; the actual JWT (or whatever credential your backend needs) stays entirely server-side, attached to outgoing requests by your own Next.js server code, never exposed to client JavaScript at all.

\`\`\`
Browser  →  Next.js Server (BFF layer: middleware + route handlers)  →  Upstream APIs
         (only an httpOnly session cookie ever reaches the browser)
\`\`\`

\`\`\`js
// middleware.ts — runs on the server before the request reaches a page/route
export function middleware(request) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

// app/api/user/route.ts — server-only route handler
export async function GET(request) {
  const token = request.cookies.get("session")?.value; // never exposed to client JS
  const res = await fetch("https://internal-api.com/user", {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  return Response.json(await res.json());
}
\`\`\`

This is why the modern recommendation for Next.js apps is: handle JWTs strictly on the server (middleware/route handlers), and never pass them to a client component or store them anywhere client-readable — the BFF layer is what makes that possible without giving up the ability to call authenticated APIs from your pages.

---

## 10. API Handling

**Fetch vs Axios**: \`fetch\` is built into every browser, but it's deliberately low-level — it doesn't auto-parse JSON, and (surprisingly to many) it does **not** reject on 4xx/5xx responses, only on actual network failure, so you must manually check \`res.ok\`. \`axios\` wraps a lot of this: automatic JSON parsing, rejecting on non-2xx by default, and request/response interceptors for things like automatically attaching auth headers to every request.

\`\`\`js
const res = await fetch(url);
if (!res.ok) throw new Error();
const data = await res.json();

const { data } = await axios.get(url); // auto-parsed, auto-throws on failure
\`\`\`

**AbortController** solves the "component unmounted before the fetch finished" problem — without it, a \`setState\` call from a request that resolves after the component is gone either errors or silently does nothing useful; with it, you can actually cancel the in-flight request itself (also useful for cancelling a stale search request when the user types a new character before the old one resolves).

\`\`\`jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [url]);
\`\`\`

**Retry, Pagination, Infinite Scroll** all address the reality that networks are unreliable and datasets are large. A basic retry strategy backs off exponentially so you're not hammering a struggling server with instant retries.

\`\`\`js
async function fetchWithRetry(url, retries = 3, delay = 500) {
  try {
    return await fetch(url);
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, retries - 1, delay * 2);
  }
}
\`\`\`

**Optimistic Updates** exist purely for perceived speed: instead of showing a spinner and waiting for the server to confirm before updating the UI, you update the UI immediately as if the request already succeeded, then quietly roll it back if the request actually fails. React 19's \`useOptimistic\` hook builds this pattern in natively.

\`\`\`jsx
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (state, newTodo) => [...state, newTodo],
);
\`\`\`

**Caching, Polling, WebSocket, SSE** are different strategies for keeping client data fresh, chosen based on how "live" the data needs to be. **Caching** avoids refetching data you already have. **Polling** repeatedly re-fetches on a timer — simple, but wasteful and never truly real-time. **WebSocket** opens one persistent, full-duplex connection where either side can push data anytime — the right tool when the server needs to proactively push updates (chat). **SSE (Server-Sent Events)** is a simpler one-way alternative — the server streams events to the client over a regular HTTP connection — good for things like live notifications where the client never needs to send data back over that same connection.

**Error Handling, Loading, Skeleton**: every piece of async UI genuinely has three distinct states to handle — loading, error, and success — and skipping any one of them is how you end up with apps that look "broken" (blank screen with no explanation) when a request is slow or fails. A **skeleton** (a gray placeholder shaped like the real content) is generally considered better UX than a spinner because it sets expectations about the shape of the incoming content and feels faster, even when actual load time is identical.

\`\`\`jsx
if (error) return <ErrorBanner message={error.message} />;
if (isLoading) return <SkeletonCard />;
\`\`\`

---

## 11. Next.js

Next.js exists because plain React only tells you how to build components — it doesn't decide routing, data fetching, or where rendering happens. Next.js is an opinionated framework layered on top of React that answers all of that, and the **App Router** (Next.js 13+) is the current, actively-developed way of doing so, built specifically around React Server Components. The older **Pages Router** still works and is common in existing codebases, but new projects default to App Router.

### Folder Structure (App Router)

Routing here is **file-system based** — folders under \`app/\` map directly to URL segments, and specially-named files inside each folder define what renders for that segment.

\`\`\`
app/
  layout.tsx        # shared shell (persists across navigations within it)
  page.tsx           # route UI for "/"
  loading.tsx        # Suspense fallback shown automatically for this segment
  error.tsx          # error boundary automatically wrapping this segment
  template.tsx       # like layout, but re-mounts (resets state) on every navigation
  dashboard/
    page.tsx         # "/dashboard"
    [id]/page.tsx    # "/dashboard/:id" — Dynamic Route, [id] becomes a URL param
\`\`\`

### Server Components vs Client Components

This is the single biggest mental shift from older React. In the App Router, **every component is a Server Component by default** — it runs only on the server, can be \`async\` and fetch data directly (no \`useEffect\` needed), and crucially, ships **zero JavaScript** to the browser for its own code, since the server already rendered it to HTML. A component only needs to become a **Client Component** (opted in with \`'use client'\` at the top of the file) if it actually needs interactivity — hooks like \`useState\`/\`useEffect\`, event handlers, or browser-only APIs.

\`\`\`jsx
// Server Component (default) — runs only on server, can be async
async function Page() {
  const data = await db.query("SELECT * FROM posts"); // direct data access, no API layer needed
  return <PostList posts={data} />;
}

// Client Component — needed for interactivity/hooks/browser APIs
("use client");
function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>{liked ? "❤️" : "🤍"}</button>
  );
}
\`\`\`

This is directly why RSC reduces bundle size compared to a fully client-rendered app: any component that's purely "fetch some data and display it" never needs to send its logic to the browser at all — only the genuinely interactive leaves of your tree do.

### Server Actions

Before Server Actions, mutating data from a form meant creating a separate API route, then calling it via \`fetch\` from the client — two files for one operation. A Server Action is a function marked \`'use server'\` that can be called _directly_ from a form's \`action\` prop (or from client code), and Next.js handles the network round-trip for you automatically, including re-validating any cached data that depended on it.

\`\`\`jsx
// app/actions.ts
"use server";
export async function createPost(formData) {
  await db.posts.create({ title: formData.get("title") });
  revalidatePath("/posts"); // tells Next.js "the cached /posts page is now stale, rebuild it"
}

// Usage directly in a form, no separate API route needed
<form action={createPost}>
  <input name="title" />
  <button>Post</button>
</form>;
\`\`\`

### Middleware

Sometimes you need logic to run _before_ a request even reaches a specific page — checking auth, redirecting based on locale, A/B test bucketing. Middleware runs at the edge, before routing resolves, and can redirect, rewrite, or modify the request/response.

\`\`\`js
export function middleware(request) {
  if (!request.cookies.get("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
export const config = { matcher: ["/dashboard/:path*"] }; // only runs for matching paths
\`\`\`

### Route Handlers

For cases where you genuinely need a traditional REST-style API endpoint (e.g., a webhook target, or an endpoint consumed by a mobile app rather than your own Next.js pages), Route Handlers let you define one per HTTP method inside \`app/api/.../route.ts\`.

\`\`\`js
export async function GET() {
  return Response.json(await getPosts());
}
export async function POST(request) {
  const body = await request.json(); /* ... */
}
\`\`\`

### Metadata, Fonts, Image, Link

These are Next.js's built-in answers to common performance/SEO pain points that plain React leaves entirely up to you. \`metadata\` auto-injects proper \`<head>\` tags for SEO. \`next/font\` self-hosts Google/custom fonts at build time instead of a client-side request to Google's font CDN, eliminating the layout shift/flash that happens while a web font loads. \`next/image\` automatically resizes, lazy-loads, and serves modern formats for images. \`next/link\` enables client-side navigation between pages (no full reload) and automatically prefetches the linked page's code when it enters the viewport or is hovered.

\`\`\`jsx
export const metadata = { title: "My App", description: "..." };

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import Image from "next/image";
<Image src="/hero.png" width={800} height={400} alt="hero" priority />;

import Link from "next/link";
<Link href="/about">About</Link>;
\`\`\`

### Caching & Revalidation (Next.js specifics)

Next.js extends the native \`fetch\` API with caching options that let you choose, per request, which rendering strategy from section 00 you actually want — this is the concrete mechanism behind SSG/ISR/SSR in the App Router.

\`\`\`jsx
fetch(url, { cache: "force-cache" }); // SSG-like — cache indefinitely until manually revalidated
fetch(url, { next: { revalidate: 60 } }); // ISR — serve cached, regenerate in background every 60s
fetch(url, { cache: "no-store" }); // SSR — always fetch fresh, every single request
\`\`\`

### Parallel Routes & Intercepting Routes

**Parallel Routes** (\`@slot\` folders) let you render multiple, independently-loading sections within the same layout at once — like a dashboard where an \`@analytics\` panel and a \`@team\` panel each fetch and render on their own timeline, rather than the whole page waiting on the slowest one. **Intercepting Routes** (\`(.)folder\` syntax) solve the "Instagram photo modal" problem: clicking a photo from a feed opens it in a modal overlay (keeping the feed visible behind it), but if the user refreshes the page while that modal's URL is active, they get the full standalone photo page instead — same URL, two different rendering contexts depending on how you arrived.

### Turbopack, Edge Runtime, Deployment

**Turbopack** is a Rust-based bundler built to replace Webpack in \`next dev\`/\`next build\`, offering much faster incremental rebuilds — this matters purely for developer experience (faster feedback loop), not runtime performance for end users. The **Edge Runtime** is a stripped-down JS runtime (no Node.js APIs like \`fs\`) that lets Middleware and some Route Handlers run at CDN edge locations physically close to the user, reducing latency for things like auth checks. **Deployment** is most seamless on Vercel (Next.js's creator, zero-config), though self-hosting via \`next start\` or Docker's "standalone" output is fully supported too.

### 🆕 React 19 in Next.js: Forms & Actions Recap

Next.js 15 leans directly into \`useActionState\` + \`useFormStatus\` + Server Actions working together — the Server Action does the actual mutation, and \`useActionState\` on the client wires up its pending state and returned result without any manual \`onSubmit\`/try-catch plumbing.

\`\`\`jsx
"use client";
import { useActionState } from "react";
import { createPost } from "./actions"; // Server Action

export default function NewPostForm() {
  const [state, formAction, isPending] = useActionState(createPost, {
    error: null,
  });
  return (
    <form action={formAction}>
      <input name="title" />
      <button disabled={isPending}>{isPending ? "Posting..." : "Post"}</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
\`\`\`

## 12. CSS

**Flexbox vs Grid**: both are layout systems, but solve different shapes of problem. Flexbox is fundamentally **one-dimensional** — it's about distributing space along a single row or column (great for navbars, button groups, centering one thing). Grid is fundamentally **two-dimensional** — you define rows and columns together up front, which is the right tool once you're actually laying out a page structure (a full dashboard grid, a photo gallery) rather than a single line of items.

\`\`\`css
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
\`\`\`

**Position / Display / Box Model**: \`position\` decides how an element participates in (or escapes) normal document flow — \`relative\` shifts it visually without removing it from flow, \`absolute\` removes it entirely and positions it relative to the nearest positioned ancestor, \`fixed\` positions relative to the viewport (stays put on scroll), \`sticky\` behaves like relative until a scroll threshold, then switches to fixed-like behavior. The **box model** describes what actually makes up an element's rendered size: \`content\` (the actual text/image), wrapped by \`padding\` (space inside the border), wrapped by \`border\`, with \`margin\` outside everything (space between this element and others). The classic beginner confusion — "why is my box bigger than the width I set" — comes from the default \`box-sizing: content-box\`, where \`width\` only sets the content area and padding/border add _on top_; \`border-box\` instead makes \`width\` include padding and border, so what you set is what you get.

\`\`\`css
.box {
  box-sizing: border-box;
  padding: 16px;
  border: 1px solid;
  margin: 8px;
}
\`\`\`

**Specificity** is the rule system CSS uses to decide which of several conflicting rules targeting the same element actually wins — it's not about which rule appears later in the file (that only matters as a tiebreaker between equal specificity), it's a weighted score: inline styles beat IDs, IDs beat classes/attributes/pseudo-classes, and those beat plain element selectors.

\`\`\`
inline style (1000) > ID (100) > class/attribute/pseudo-class (10) > element (1)
\`\`\`

**Responsive Design / Media Queries** exist because a fixed layout designed for a desktop screen simply breaks on a phone — media queries let you apply different CSS rules based on conditions like viewport width, letting one stylesheet adapt to many screen sizes.

\`\`\`css
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
\`\`\`

**Animations**: \`transition\` smoothly interpolates a property between two states over time (e.g., a hover effect), while \`@keyframes\` lets you define a more complex, multi-step animation sequence that can run automatically rather than only in response to a state change.

\`\`\`css
.box {
  transition: transform 0.3s ease;
}
.box:hover {
  transform: scale(1.05);
}
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
\`\`\`

**Styling Approaches**: the differences here mostly come down to _when_ the CSS is generated and _how scoped_ it is. Tailwind avoids writing custom CSS almost entirely by giving you small utility classes composed directly in markup — fast to write, no naming decisions, but markup gets verbose. CSS Modules give each file its own automatically-scoped class names, so you write normal CSS without worrying about a class name colliding with one in another file, and it costs nothing at runtime since it's resolved at build time. Styled Components write actual CSS inside your JS, which lets styles react to props dynamically, but that dynamism costs a small runtime overhead. SCSS is just CSS with programming conveniences (variables, nesting, mixins) compiled down to plain CSS ahead of time — no runtime cost, but no dynamic prop-based styling either. BEM isn't a tool at all, just a naming convention (\`.block__element--modifier\`) for keeping plain CSS class names collision-free and self-documenting without any tooling.

---

## 13. Testing

**Jest / Vitest** are test runners — they discover test files, run them, and report pass/fail. Vitest has increasingly become the default for new projects mainly because it's built to work natively with Vite's fast dev/build pipeline (Jest's config can be slower and more finicky in a Vite-based project).

\`\`\`jsx
test("adds numbers", () => {
  expect(sum(1, 2)).toBe(3);
});
\`\`\`

**React Testing Library (RTL)** encodes a specific testing philosophy: test your components the way a real user would interact with them — find things by visible text or accessibility role, click them, and assert on what appears — rather than reaching into component internals (state, props) directly. The reasoning: tests written against internal implementation break every time you refactor _how_ something works, even if _what it does for the user_ hasn't changed; testing through the user-facing behavior avoids that fragility.

\`\`\`jsx
render(<Button title="Save" />);
expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
fireEvent.click(screen.getByRole("button"));
\`\`\`

**Cypress / Playwright** step up from component-level testing to true **end-to-end (E2E)** testing — they drive an actual real browser, clicking through your actual running app exactly like a user would, catching integration issues (routing, real network calls, cross-component interactions) that isolated component tests can't. Playwright has gained ground over Cypress mainly by supporting multiple browser engines natively and generally running faster.

**Mocking** replaces a real dependency (an API call, a module) with a fake, controlled version during a test — this is what lets you test "what does my component do when the API returns an error" without actually needing a real failing API to test against.

\`\`\`js
jest.mock("./api", () => ({
  getUser: jest.fn(() => Promise.resolve({ name: "Ru" })),
}));
\`\`\`

**Snapshot Testing** takes a "picture" of your rendered output the first time a test runs and saves it; on future runs, it fails if the output differs from that saved snapshot. It's genuinely good at catching _accidental_ UI changes, but it has a real weakness: when a snapshot test fails, the easiest response is often to blindly run "update snapshot" without actually reviewing whether the change was intentional — which quietly defeats the entire point of the test.

**Coverage** measures what percentage of your code actually executed during your test suite (by statement, branch, function, or line). It's a useful smell-detector for completely untested code, but a high coverage number doesn't mean your tests are _good_ — a line can be "covered" by a test that never actually asserts anything meaningful about it.

---

## 14. Accessibility (a11y)

**ARIA (Accessible Rich Internet Applications)** exists to describe the _role_, _state_, and _properties_ of custom UI elements to assistive technology (screen readers), for cases where plain HTML doesn't already convey that meaning on its own — e.g., a \`<div>\` styled to look like a dropdown has no inherent "this is a dropdown, currently closed" meaning for a screen reader until you add ARIA attributes.

\`\`\`jsx
<button aria-label="Close menu" aria-expanded={isOpen}>×</button>
<div role="alert">Form submitted successfully</div>
\`\`\`

The common guidance "no ARIA is better than bad ARIA" exists because incorrect ARIA actively _overrides_ a screen reader's normal (usually correct) interpretation of an element — misusing it can make something less accessible than not touching it at all.

**Semantic HTML** is almost always the better first move before reaching for ARIA, because tags like \`<nav>\`, \`<button>\`, and \`<main>\` already carry built-in meaning, keyboard behavior, and screen-reader announcements for free — a real \`<button>\` is focusable and triggerable by Enter/Space automatically; a \`<div onClick>\` styled to look like a button gives you none of that unless you manually re-implement it.

\`\`\`html
<nav>...</nav>
<main>...</main>
<article>...</article>
<button>...</button>
\`\`\`

**Keyboard Navigation & Focus** matter because a meaningful portion of users (motor impairments, screen reader users, power users) never touch a mouse at all — every interactive element needs to be reachable and operable via Tab/Enter/Space/Arrow keys alone. A **focus trap** keeps keyboard focus cycling within an open modal instead of tabbing out into the page behind it (which would be confusing since the modal visually blocks that page). \`:focus-visible\` specifically shows a focus outline only when navigating by keyboard, not on a mouse click — solving the old complaint that focus rings look "ugly" on mouse clicks while still preserving them where they're actually needed.

**Contrast**: WCAG AA requires at least a 4.5:1 contrast ratio between text and its background for normal-sized text (3:1 for large text) — this isn't an arbitrary aesthetic preference, it's the threshold below which text becomes genuinely hard to read for users with low vision or in bright ambient light.

**Screen Readers**: testing with an actual screen reader (VoiceOver on Mac, NVDA on Windows) is the only reliable way to catch accessibility issues that look fine visually but are broken for assistive tech — missing \`alt\` text, unlabeled form inputs, or landmark regions (\`<nav>\`, \`<main>\`) that aren't announced meaningfully as you navigate.

---

## 15. Security

**XSS (Cross-Site Scripting)** happens when an attacker manages to get their own JavaScript to execute in another user's browser session — usually by injecting a \`<script>\` tag or event handler through unsanitized user input that later gets rendered as raw HTML. React actually protects you from this by default: \`{userInput}\` is always escaped as plain text, never interpreted as HTML — the danger only appears when you explicitly opt out of that protection.

\`\`\`jsx
// Dangerous — never do this with unsanitized input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
\`\`\`

**CSRF (Cross-Site Request Forgery)** exploits the fact that cookies are sent automatically with every request to their domain — an attacker's malicious site can trigger a request to _your_ app, and if the user's browser still has a valid session cookie for your app, that request goes through with their credentials, even though they never intended it. \`SameSite\` cookie attributes and CSRF tokens are the standard defenses — both aim to prove a request genuinely originated from your own site's forms/scripts, not a third-party page.

**CSP (Content Security Policy)** is a response header that tells the browser exactly which sources are allowed to execute scripts, load styles, or fetch resources on your page — it's a major defense-in-depth layer against XSS, because even if an attacker manages to inject a script tag, the browser will simply refuse to execute it if its source isn't on the allow-list.

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com
\`\`\`

**Clickjacking** tricks a user into clicking something they didn't mean to, by layering an invisible iframe of your real site over a decoy UI (e.g., "click here to win a prize" that actually clicks your site's "delete account" button underneath). \`X-Frame-Options: DENY\` (or the modern CSP \`frame-ancestors\` directive) tells browsers to refuse to render your page inside any iframe at all, closing off this attack.

**Sanitization** means stripping or escaping dangerous HTML/script content out of user input _before_ rendering or storing it — necessary any time you deliberately render user-generated HTML (like a rich-text comment), since simply trusting the input as-is is exactly how XSS happens.

**HTTPS** encrypts traffic between browser and server, which is non-negotiable for any app handling auth/cookies — without it, session cookies and credentials are readable by anyone on the same network (public wifi, ISP, etc.), and many modern browser APIs (geolocation, service workers) simply refuse to work at all over plain HTTP.

**JWT & Secrets**: because a JWT's payload is only base64-encoded (readable by anyone, not encrypted), it should never contain sensitive data — and signing secrets or API keys must live only on the server, never inside a client bundle or a \`NEXT_PUBLIC_\` env var, since anything with that prefix is deliberately shipped to the browser and visible to anyone who opens dev tools.

**Rate Limiting** caps how many requests a given IP/user can make in a time window, which is the primary defense against brute-force login attempts and general API abuse — commonly implemented at the edge/middleware layer using something like Redis to track request counts per key.

---

## 16. Frontend System Design

**Folder Structure & Component Design** decisions become genuinely consequential once an app grows past a handful of screens — organizing by feature/domain rather than by file type (see the FSD deep-dive in section 18) is what keeps a large codebase navigable instead of turning into one enormous \`components/\` folder nobody can find anything in.

**Micro Frontends** apply the same "split a monolith into independently deployable pieces" idea backend teams use for microservices, but to the frontend — different teams own and deploy entirely separate frontend apps (via Module Federation or single-spa) that are composed together into one experience at build or runtime. This mainly makes sense at real organizational scale, where multiple independent teams need to ship on their own schedule without stepping on each other.

**State Strategy** is about recognizing that not all state is the same kind of problem — a piece of state might genuinely be local-component-only, might need to be shared across the client, might really be a cached copy of server data, or might actually belong in the URL (so it's shareable/bookmarkable, like a search filter). Choosing the wrong "home" for a given piece of state — e.g., putting server data in Redux instead of a proper server-cache library — is one of the most common sources of unnecessary complexity in large apps.

**Caching** exists at multiple layers simultaneously in a real app — the browser's own HTTP cache, a CDN caching static assets close to users, Next.js's server-side data cache, and a client library like React Query caching fetched data in memory — and each layer has a different invalidation story, which is why "just add caching" is rarely a one-line fix in practice.

**API Layer**: routing every network call through a dedicated \`services/\`/\`api/\` module (instead of calling \`fetch\` directly inside components) means you have exactly one place to add things like auth headers, retry logic, or error normalization — and one place to update if the backend's URL or auth scheme changes.

**Error Boundary**: React doesn't automatically catch and gracefully handle errors thrown during rendering — by default, an uncaught render error unmounts the _entire_ app. An Error Boundary is a component that specifically catches errors thrown by its children during rendering and shows a fallback UI instead of blanking the whole page — genuinely important at the route or major-section level so one broken widget doesn't take down everything else.

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
\`\`\`

**Logging, Analytics, Monitoring** answer three different questions once your app is in production and you can no longer watch users directly: Sentry/LogRocket answer "what broke, and for whom" (error tracking); Google Analytics/Amplitude/PostHog answer "what are users actually doing" (product analytics); Datadog/New Relic answer "is the app fast and healthy right now" (performance/infra monitoring).

**Feature Flags** let you ship code to production that's turned _off_ for most users, and flip it on gradually (or for specific users/cohorts) without a redeploy — this decouples "deploying code" from "releasing a feature," which makes gradual rollouts and A/B testing possible without risky big-bang releases.

**CDN (Content Delivery Network)**: since network latency is largely a function of physical distance, a CDN caches your static assets (JS, CSS, images) on servers distributed globally, so a user in Mumbai gets served from a nearby edge location instead of your single origin server on the other side of the planet.

---

## 17. Interview Questions (Core Concepts to Explain Out Loud)

- **Why Virtual DOM?** Directly manipulating the real DOM for every small change is slow, because the browser has to re-run layout/paint on real, expensive DOM nodes. React keeps a lightweight in-memory representation instead, computes the _minimal_ set of actual changes needed by diffing old vs. new, and only touches the real DOM for that minimal set.
- **Why React?** It made UI development declarative (describe _what_ the UI should look like for a given state, not the imperative steps to get there), popularized reusable components, and its ecosystem/tooling (plus now first-class server rendering via RSC) has kept it dominant.
- **Fiber**: React's internal reconciliation engine (since React 16) that represents rendering work as a linked list of units that can be paused, resumed, and prioritized — this is the low-level machinery that makes concurrent features like \`useTransition\` possible; before Fiber, rendering was a single uninterruptible synchronous pass.
- **Hydration**: explained fully in section 00/11 — the short version is "attach interactivity to already-correct server HTML" rather than throwing that HTML away and re-rendering from scratch.
- **Diffing / Reconciliation**: React compares the old and new element trees level-by-level (not a full generic tree-diff, which would be prohibitively slow at O(n³)) — using element _type_ and \`key\` as heuristics, it achieves an O(n) approximation that's correct for the vast majority of real UI changes.
- **Rules of Hooks**: hooks must be called in the exact same order on every render, which is only possible if you call them unconditionally at the top level — React actually tracks each hook's state by its _call position_ in that order, not by name, so a hook inside an \`if\` would shift every subsequent hook's position and silently corrupt state.
- **Strict Mode**: a development-only wrapper that deliberately double-invokes render functions and effects, specifically to surface bugs (impure rendering, missing cleanup) that would otherwise only show up unpredictably in production under concurrent rendering.
- **React.memo vs useCallback**: they solve complementary halves of the same problem — \`memo\` decides whether a component should skip re-rendering based on its props; \`useCallback\` is what makes a function prop _stable_ enough for that comparison to actually succeed instead of failing every time due to a fresh function reference.
- **Redux vs Context**: Context is built-in and fine for values that rarely change (theme, current user); Redux adds structured actions/reducers, devtools with time-travel debugging, middleware, and — critically — better performance for frequently-changing state, since Context re-renders every consumer on any change while Redux-connected components can subscribe selectively.
- **SSR vs CSR**: SSR trades server compute cost for a faster, SEO-friendly first paint; CSR trades a slower, empty-shell first load for simpler infrastructure (no server rendering needed) and calmer server cost at scale.
- **Next.js rendering choice**: pick based on how often the data changes and whether SEO matters — SSG for rarely-changing public content, ISR for periodically-changing public content, SSR for per-request personalized/dynamic content, CSR for interactive, non-SEO-critical UI like authenticated dashboards.

> Use this section as a talking-points index — pair each bullet with the fuller explanation already given in the relevant numbered section above.

---

## 18. Project Architecture

### Classic Layered Structure

\`\`\`
src/
  components/   hooks/    pages/     services/
  store/        utils/    types/     styles/
  constants/    middleware/  api/
\`\`\`

This organizes files **by technical type** — all components together, all hooks together, and so on. It's easy to understand immediately and works fine for small-to-medium apps, but it has a real scaling problem: as the app grows, \`components/\` becomes a folder with 200 unrelated files, and understanding "everything related to checkout" means hunting across five different top-level folders instead of looking in one place.

### Enterprise Approaches

- **Feature-based**: instead of grouping by type, group by feature (\`features/checkout/\`, \`features/profile/\`), with each feature folder owning its own components/hooks/api calls/types internally. This directly fixes the classic-structure problem — everything related to one feature lives together, and deleting a feature is (ideally) deleting one folder.
- **Domain-driven**: structures the frontend to mirror actual business domains (Orders, Inventory, Users) rather than technical features — this tends to fit large organizations where the frontend structure needs to map cleanly onto how the backend/business is already divided into bounded contexts.
- **Monorepo**: keeps multiple related apps/packages (a web app, a mobile app, a shared UI kit, shared utilities) in a single repository, managed by tools like Turborepo/Nx/pnpm workspaces — the appeal is sharing code across apps with atomic commits (a single PR can update the shared button component _and_ every app using it, in sync), instead of coordinating version bumps across separate repos.

### 🆕 Feature-Sliced Design (FSD)

Feature-based organization is a good instinct, but on its own it doesn't stop teams from creating messy, circular dependencies between features (feature A quietly importing something from feature B, which imports back from A). FSD is a **stricter methodology** that adds an explicit hierarchy of layers on top of the feature-folder idea, plus an enforced rule about which layers are allowed to import from which — specifically to prevent that kind of dependency chaos once a codebase gets large enough that no single person can hold the whole dependency graph in their head.

**Layers, ordered top to bottom — each layer may only import from layers strictly below it:**

\`\`\`
app        — app-wide setup: providers, routing, global styles, entry point
pages      — compositions of widgets/features for a specific route
widgets    — large self-contained UI blocks composed of features/entities (e.g., Header, ProductCard)
features   — user-facing actions/use-cases (e.g., AddToCart, LikePost, LoginForm)
entities   — business domain objects (e.g., User, Product) — their data + basic UI
shared     — reusable, domain-agnostic code (UI kit, API client, utils, config)
\`\`\`

\`\`\`
src/
  app/
  pages/
    product-page/
  widgets/
    header/
  features/
    add-to-cart/
      ui/
      model/
      api/
  entities/
    product/
      ui/
      model/
  shared/
    ui/
    api/
    lib/
\`\`\`

The rule in practice: a \`feature\` is allowed to use \`entities\` and \`shared\`, but is never allowed to import directly from another \`feature\`, and definitely never from anything above it (\`widgets\`/\`pages\`/\`app\`). This one-way dependency graph is precisely what stops the "everything secretly depends on everything" problem that ad-hoc feature folders don't prevent — which is why FSD has become a de-facto standard for large React/Next.js monorepos and enterprise codebases: every engineer has a predictable, enforced answer to "where does this code belong, and what is it allowed to depend on."

---

## 19. Machine Coding (Practice List)

The value of these isn't memorizing a "correct" solution — it's building the muscle memory for the trade-offs that come up in almost every real interview build:

- **Todo App** — CRUD, filtering, localStorage persistence.
- **Kanban Board** — drag & drop (\`react-dnd\`/\`dnd-kit\`), managing column/card state cleanly.
- **File Explorer** — a recursive tree component, expand/collapse state per node.
- **Infinite Scroll** — \`IntersectionObserver\` combined with pagination.
- **Typeahead / Autocomplete** — debounced search, keyboard navigation, and the ARIA combobox pattern for accessibility.
- **Dashboard** — composing widgets/charts into a responsive grid.
- **Chat App** — WebSocket/SSE, optimistic message sending, auto-scroll-to-bottom behavior.
- **Shopping Cart** — shared/global state, quantity updates, correctly derived totals.
- **Instagram Feed** — infinite scroll + lazy-loaded images + optimistic like/comment UI.
- **Netflix UI** — horizontally-scrolling rows, modal preview on hover.
- **Twitter Clone** — feed, compose flow, optimistic posting, nested replies.
- **Google Keep** — masonry grid layout, drag-to-reorder, color picker, local persistence.

**Tip:** in interviews, narrate your trade-offs out loud as you build (why controlled vs. uncontrolled here, why this data structure, how this would hold up at 10,000 items) — interviewers are generally evaluating your reasoning process more than whether you finish the whole thing.

---

## 20. Best Practices

- **Folder Naming**: pick one casing convention (commonly \`kebab-case\` for folders, \`PascalCase\` for component files) and apply it consistently across the whole repo — inconsistency here is a small thing that compounds into real friction as a codebase and team grow.
- **Reusable Components**: design components to vary through props (\`variant\`, \`size\`) rather than copy-pasting a near-identical component for every slight visual difference — the latter means every future bug fix has to be applied N times.
- **Error Boundaries**: place them at route or major-widget boundaries specifically so one crashing component degrades gracefully instead of taking down the entire app.
- **Loading States / Empty States**: every piece of async UI genuinely has three states worth designing for — loading, empty (successfully loaded, but there's nothing to show — not an error), and error — and skipping the empty/error cases is one of the most common gaps between a "demo" and a production-ready feature.
- **API Separation**: keep all network calls behind a \`services/\`/\`api/\` layer rather than calling \`fetch\` inline inside components, so there's one place to change if an endpoint or auth scheme changes.
- **Hooks Separation**: pull non-trivial logic out into custom hooks (\`useCart\`, \`useAuth\`) so components stay focused on describing UI, not managing complex logic inline.
- **Avoid Inline Functions in Hot Paths**: creating a new function/object literal inline as a prop on every render defeats a memoized child's \`React.memo\` check, since a fresh reference always looks like "changed props" — \`useCallback\` or module-level constants avoid that. (The React Compiler, section 06, reduces how often this manual discipline actually matters — but it's still worth understanding why it mattered.)
- **Accessibility & SEO**: build these in from the start rather than retrofitting — semantic HTML/ARIA/metadata decisions are far cheaper to get right upfront than to unwind later across a large codebase.
- **Performance**: measure before optimizing — use the Profiler/Lighthouse to find the actual bottleneck rather than speculatively wrapping everything in \`useMemo\`, which adds complexity without guaranteed benefit.
- **Code Review Checklist**: naming clarity, no dead code left behind, tests covering the critical paths, basic accessibility considered, no secrets committed, proper error handling present, and no obviously unnecessary re-renders introduced by the change.

---

## Bonus: React Rendering Flow

\`\`\`
State Change → Render Phase → Diffing → Reconciliation → Commit Phase → Browser Paint
\`\`\`

The **Render Phase** is where React calls your component functions to build a new element tree — this is deliberately pure and side-effect-free, which is what allows React to pause, throw away, or restart this work mid-way under concurrent rendering, without anything user-visible having happened yet. Diffing/Reconciliation (covered fully in section 17) then figures out the minimal real change needed. The **Commit Phase** is where React finally writes those changes to the actual DOM — this part is synchronous and can't be interrupted, since partially-applied DOM changes would leave the page in a broken visual state.

## Bonus: React Lifecycle (Hooks Mental Model)

\`\`\`
Mount:   Render → useLayoutEffect → Paint → useEffect
Update:  Render → Cleanup (prev effect) → useLayoutEffect → Paint → useEffect
Unmount: Cleanup
\`\`\`

The ordering here is the whole point to internalize: \`useLayoutEffect\` always runs _before_ the browser paints (so DOM measurements never visibly flicker), while \`useEffect\` always runs _after_ paint (so it never blocks the user from seeing the update) — and on every update after the first, whatever cleanup function you returned from the _previous_ effect run always fires before the new one, ensuring you never accumulate duplicate subscriptions/timers.

## Bonus: Next.js Rendering Decision Tree

\`\`\`
Need SEO?
├── Yes
│   ├── Data changes rarely       → SSG
│   ├── Data changes periodically → ISR
│   └── Data changes every request→ SSR
└── No → CSR
\`\`\`

## Bonus: React Performance Decision Tree

\`\`\`
Slow renders?
├── Expensive calculation?             → useMemo (or let React Compiler handle it)
├── Stable callback needed?            → useCallback (or React Compiler)
├── Component re-renders unnecessarily?→ React.memo
├── Long lists?                        → Virtualization
└── Large bundle?                      → Lazy loading / Code splitting
\`\`\`

Read this tree as a diagnostic flow, not a checklist to apply everywhere upfront: start from an actual observed slowness (via the Profiler), then match the _specific_ cause to the _specific_ fix — applying all of these preemptively adds real complexity for optimizations you may not even need.
`
  },
  {
    id: "nodejs-express",
    title: "Node.js & Express Cheat Sheet",
    description: "Asynchronous event loop, middleware patterns, authentication, clustering, database pooling, and performance monitoring.",
    category: "Backend Development",
    yoe: "Junior-Mid",
    readTime: "25 min read",
    icon: "node",
    content: `# Backend Engineering Handbook

> Written to actually explain _why_ things work the way they do, not just define them. Chapters marked with the full template (What is it? / Why? / History / How it works / Syntax / Real-world / Production story / Mistakes / Best practices / Performance / Security / Interview questions / Related topics) are fully expanded — the rest still carry the same explanatory tone and are next in line for the same treatment. Everything stays in this one file, in sequence, so it's a single place to search and revise from.
>
> **Fully expanded so far (full template + production story):** §01 HTTP, §02 REST APIs (idempotency deep dive), §03 Node.js, §04 Express.js, §05 Databases, §07 Indexes, §10 Authentication, §11 Authorization, §12 Security, §13 Caching, §15 API Design, §18 Error Handling, §20 Background Jobs, §21 Message Queues, §22 WebSockets, §23 Microservices, §24 Backend System Design.
> **Next up:** §06/§08/§09 (SQL/Mongo/ORMs), §14/§16/§17/§19/§25–§34, then the four gold-standard chapters (Design Patterns, System Design Patterns, Database Deep Dive, Production Engineering).

---

## Table of Contents

0.  [Backend Fundamentals](#00-backend-fundamentals)
1.  [HTTP](#01-http)
2.  [REST APIs](#02-rest-apis)
3.  [Node.js](#03-nodejs)
4.  [Express.js](#04-expressjs)
5.  [Databases](#05-databases)
6.  [SQL](#06-sql)
7.  [PostgreSQL](#07-postgresql)
8.  [MongoDB](#08-mongodb)
9.  [ORMs](#09-orms)
10. [Authentication](#10-authentication)
11. [Authorization](#11-authorization)
12. [Security](#12-security)
13. [Caching](#13-caching)
14. [Performance](#14-performance)
15. [API Design](#15-api-design)
16. [Validation](#16-validation)
17. [Logging](#17-logging)
18. [Error Handling](#18-error-handling)
19. [File Uploads](#19-file-uploads)
20. [Background Jobs](#20-background-jobs)
21. [Message Queues](#21-message-queues)
22. [WebSockets](#22-websockets)
23. [Microservices](#23-microservices)
24. [Backend System Design](#24-backend-system-design)
25. [Testing](#25-testing)
26. [Docker](#26-docker)
27. [Kubernetes](#27-kubernetes)
28. [CI/CD](#28-cicd)
29. [AWS](#29-aws)
30. [Observability](#30-observability)
31. [Architecture](#31-architecture)
32. [Interview Questions](#32-interview-questions)
33. [Project Structure](#33-project-structure)
34. [Best Practices](#34-best-practices)

- [Bonus: Full Diagrams & Decision Trees](#bonus-sections)

---

## 00 Backend Fundamentals

Every backend, no matter how complex, is doing one basic job: a client asks for something, and the server figures out the right answer and hands it back.

\`\`\`
Client → Request → Server → Business Logic → Database → Response
\`\`\`

The reason this simple picture matters is that almost every backend bug or design decision traces back to one of these arrows breaking down — a request that never arrives, business logic that runs twice, a database that can't keep up.

**Client vs Server** — the client (browser, mobile app, another service) _initiates_ things; it doesn't own the source of truth. The server owns the data and the rules, which is exactly why you never trust anything the client sends without re-checking it server-side — the client can be tampered with, the server is your only real gatekeeper.

**Stateless vs Stateful** — this distinction decides how easily you can scale. A stateless server keeps no memory of who you are between requests; every request must carry everything needed to understand it (like a JWT with your identity baked in). That's powerful because you can throw the _same_ request at any server instance and get the same result — which is exactly what horizontal scaling needs. A stateful server remembers you (e.g., an in-memory session), which means a specific user has to keep hitting the _same_ server instance, or you need to share that state somewhere all instances can reach (Redis) — otherwise a user logs in on server A and appears logged out on server B.

**Monolith vs Distributed System** — a monolith is simpler to build, test, and deploy because everything lives in one process talking to itself through function calls. The tradeoff shows up as you grow: one team's bug can take down the whole app, and you can't scale just the "search" part without scaling everything else. A distributed system splits things into independent services so you _can_ scale and deploy pieces independently — but now function calls become network calls, which can fail, time out, or arrive out of order. You're trading simplicity for scalability, and that tradeoff is the whole reason microservices exist (see §23).

**Horizontal vs Vertical Scaling** — vertical scaling (a bigger machine) is the easy first move, but it has a hard ceiling and a single point of failure: that one machine dies, everything dies. Horizontal scaling (more machines) has no real ceiling and survives individual machine failures, but it only works cleanly if your app is stateless — which is why "make it stateless" is one of the first things you hear in system design interviews.

### Layered backend architecture

\`\`\`
Client → API Layer → Service Layer → Repository Layer → Database
\`\`\`

Each layer exists to answer a different question, and keeping them separate is what makes a codebase testable and changeable later:

- **API layer** answers "how does this request come in and go out" — routing, request parsing, response shaping. It shouldn't know _why_ the business does what it does.
- **Service layer** answers "what should actually happen" — the business rules. It doesn't care whether the data comes from Postgres or an API call.
- **Repository layer** answers "how do I get/store this data" — it's the only layer that knows what database you're using.

The payoff: if you need to unit-test your business logic, you can swap the repository for a fake one in memory and test the service layer without touching a real database. And if you migrate from Postgres to Mongo later, only the repository layer changes — the service layer never notices.

---

## 01 HTTP

### What is it?

HTTP (HyperText Transfer Protocol) is the agreed-upon language a client and a server use to ask for and hand back things over a network. You don't need to know anything about the other side's programming language, OS, or framework — as long as both sides speak HTTP, a browser can talk to a server written in anything.

### Why do we need it?

Before a shared protocol like HTTP, every client and server pairing would need its own private agreement on how to format a request, which is obviously unworkable at the scale of "the entire internet." HTTP is the common contract that lets a browser written by Google talk to a server written by anyone, anywhere, without either side knowing anything about the other's internals — that universality is the entire reason the web works at all.

### History — how we got from 0.9 to 3

- **HTTP/0.9 (1991)** — absurdly minimal: a client could only send a one-line request (\`GET /page\`), and the server could only respond with raw HTML — no headers, no status codes, no other methods.
- **HTTP/1.0 (1996)** — added headers, status codes, and other methods (POST, HEAD), but every single request opened a _new_ TCP connection and closed it after the response — expensive when a page needs dozens of assets.
- **HTTP/1.1 (1997)** — added persistent connections (\`Keep-Alive\`) so multiple requests could reuse one TCP connection sequentially, plus chunked transfer encoding and better caching. This became the dominant version for nearly two decades, but it inherited the head-of-line blocking problem covered below.
- **HTTP/2 (2015)** — multiplexing over a single connection + header compression (HPACK).
- **HTTP/3 (2022, standardized)** — moved off TCP entirely onto QUIC (UDP-based).

### How it works internally — what actually happens when you type google.com and hit Enter

This is the question every "explain HTTP" conversation should be able to answer, because it forces you to connect DNS, TCP, TLS, and HTTP into one real sequence instead of knowing them as separate trivia:

\`\`\`
1. DNS Resolution
   Browser checks its own cache → OS cache → router → ISP's DNS resolver
   → recursively asks root servers → .com TLD servers → google.com's
   authoritative nameserver → gets back an IP address, e.g. 142.250.190.14

2. TCP Handshake (3-way)
   Client → SYN      → Server
   Client ← SYN-ACK  ← Server
   Client → ACK      → Server
   (A reliable, ordered connection now exists between client and server)

3. TLS Handshake (if HTTPS — almost always today)
   Client and server agree on a cipher suite, the server proves its identity
   via its certificate (signed by a trusted Certificate Authority), and both
   sides derive a shared symmetric encryption key for the session.
   (HTTP/3 folds this into the same round trip as the transport handshake —
   see the HTTP/1.1 → 2 → 3 breakdown below for why that matters.)

4. HTTP Request Sent
   GET / HTTP/2
   Host: google.com
   Accept: text/html
   ...

5. Server Processing
   Reverse proxy (Nginx) → load balancer → app server → business logic
   → maybe a database/cache lookup → response assembled

6. HTTP Response Sent Back
   HTTP/2 200 OK
   Content-Type: text/html
   <html>...</html>

7. Browser Rendering
   Parses HTML → builds the DOM → discovers more resources (CSS, JS, images)
   → fires off MORE HTTP requests for each of those (this is exactly why
   HTTP/1.1's per-connection limits and HOL blocking mattered so much in
   practice — a real page isn't one request, it's dozens)
   → paints the page
\`\`\`

The reason this sequence matters beyond trivia: almost every "why is my site slow" investigation is really asking _which step in this chain is taking too long_ — a slow DNS resolver, an unnecessarily large TLS certificate chain, a server that's slow to generate the response, or a page making too many round trips for its own assets.

### HTTP/1.1 → HTTP/2 → HTTP/3 — the actual story

**HTTP/1.1** sends one request, waits for its response, before it can reuse that connection for the next request (in practice — pipelining technically exists but browsers don't really use it because it's fragile). So if you need to load 30 assets for a page, and one of them is slow, it queues up behind that one on the same connection. This is called **head-of-line (HOL) blocking at the application layer**. Browsers hacked around it by opening ~6 parallel TCP connections per host — which works, but each new TCP connection means a fresh handshake, fresh congestion-control ramp-up, and real overhead.

**HTTP/2** fixed that specific problem with **multiplexing**: many requests and responses now share a _single_ TCP connection at the same time, each broken into small frames tagged with a stream ID so the receiving end can reassemble them independently. A slow request no longer blocks a fast one at the application level. HTTP/2 also introduced **HPACK header compression** — since HTTP headers (cookies, user-agent, etc.) repeat on almost every request to the same host, compressing them (and only sending the _diff_ from previous headers) saves real bandwidth on chatty APIs.

But HTTP/2 didn't actually escape head-of-line blocking — it just moved where it happens. TCP itself guarantees **strictly ordered, reliable byte delivery**. So if a single packet gets lost anywhere on the network, TCP will not hand _any_ of the multiplexed streams to the application until that lost packet is retransmitted and the byte order is restored — even though the other streams' bytes already arrived. One lost packet now stalls every request sharing that connection. This is **HOL blocking at the transport layer**, and it's structurally impossible to fix while still using TCP, because it's baked into what TCP promises.

**HTTP/3** solves this by ditching TCP entirely and running over **QUIC**, a transport protocol built on top of UDP. QUIC implements its own reliability and ordering, but crucially, it does so **per stream**, not for the whole connection — so a lost packet only stalls the one stream it belonged to, and every other stream keeps flowing. QUIC also merges what used to be two separate round trips (TCP handshake, then TLS handshake) into essentially one combined handshake — on a repeat connection it can even resume with **0-RTT**. This matters a lot in practice on mobile networks, where packet loss and connection re-establishment (e.g., switching from WiFi to cellular) are common; QUIC also identifies connections by a connection ID rather than the IP/port 4-tuple, so switching networks doesn't even require a new handshake.

**The one-liner to keep in memory:**

> HTTP/1.1 blocked at the app layer → HTTP/2 fixed that with multiplexing but inherited TCP's transport-layer blocking → HTTP/3 replaced TCP with QUIC/UDP to fix blocking at the transport layer too, and to make handshakes fast and resilient on unreliable networks.

### Methods — and what "idempotent" actually buys you

The methods aren't just labels — the guarantees attached to them (safe, idempotent) are what allow browsers, proxies, and retry logic to behave correctly without knowing anything about your specific API. If a method is **idempotent**, a client (or a retry mechanism, or a flaky network) can safely resend the exact same request multiple times and the end state is the same as sending it once — which is exactly why GET requests get cached and retried freely, but POST requests don't (retrying a POST could mean creating the same order twice).

| Method  | Idempotent?    | Safe? | Use                                                                                               |
| ------- | -------------- | ----- | ------------------------------------------------------------------------------------------------- |
| GET     | Yes            | Yes   | Fetch a resource, no side effects                                                                 |
| POST    | No             | No    | Create a resource / trigger a non-repeatable action                                               |
| PUT     | Yes            | No    | Replace a resource entirely — sending it twice leaves the same end state                          |
| PATCH   | Not guaranteed | No    | Partial update — depends on how you write it (\`set x=5\` is idempotent, \`increment x by 1\` is not) |
| DELETE  | Yes            | No    | Remove a resource — deleting twice still ends with it gone                                        |
| OPTIONS | Yes            | Yes   | Browser asks "what am I allowed to do here" before a real request (CORS preflight)                |
| HEAD    | Yes            | Yes   | Same as GET but headers only — useful to check if something exists/changed without downloading it |

### Status codes — grouped by what they're telling the caller

\`\`\`
1xx  "Hold on, still working"     100 Continue
2xx  "It worked"                  200 OK, 201 Created, 204 No Content
3xx  "Go look somewhere else"     301 Moved Permanently, 304 Not Modified
4xx  "You (the client) messed up" 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests
5xx  "I (the server) messed up"   500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
\`\`\`

The 4xx vs 5xx split matters operationally: a spike in 4xx usually means a client bug or bad input (not your pager-worthy emergency), while a spike in 5xx means _your_ system is failing and is exactly what alerting should be tuned to catch.

### Headers, cookies & caching — why each flag exists

Cookie flags aren't arbitrary — each one closes a specific attack. \`HttpOnly\` means JavaScript running on the page can't read the cookie at all, which matters because if an attacker manages to inject a script (XSS), they still can't steal your session token through \`document.cookie\`. \`Secure\` means the cookie is only ever sent over HTTPS, so it can't be sniffed on plain HTTP. \`SameSite=Strict/Lax\` stops the browser from attaching your cookie to requests that originate from _other_ sites, which is the core defense against CSRF (§12).

Caching headers exist so the client and any proxies in between don't have to re-fetch (or re-generate) something that hasn't changed. \`ETag\` is a fingerprint of the response body; the client sends it back next time via \`If-None-Match\`, and if it still matches, the server replies \`304 Not Modified\` with an _empty_ body — you save the bandwidth of re-sending data the client already has.

\`\`\`http
GET /users/42 HTTP/2
Accept: application/json
Authorization: Bearer <token>

HTTP/2 200 OK
Content-Type: application/json
Cache-Control: max-age=60
ETag: "abc123"
\`\`\`

### Production story

> A product API was returning fine individually, but the mobile app felt sluggish specifically on flaky cellular connections, even though the same requests were fast on office WiFi. Investigation showed the API was still being served over HTTP/1.1 through an older load balancer config. On a lossy mobile connection, a single dropped packet was stalling _every_ concurrent request sharing that connection (transport-layer HOL blocking — see below). Switching the load balancer and origin to terminate HTTP/2 (and later enabling HTTP/3 at the CDN edge) cut p95 latency on cellular connections dramatically, with no application code changes at all — it was purely a transport-layer fix. The lesson: sometimes "the API is slow" isn't a backend logic problem at all, it's the protocol underneath it.

### Common mistakes

- Treating HTTP/2's multiplexing as if it eliminated _all_ head-of-line blocking — it only fixed it at the application layer; TCP-level blocking is still there (see below).
- Using GET for something that has side effects (e.g., \`GET /users/42/delete\`) — breaks caching, breaks safe retries, and browsers/crawlers may prefetch it, accidentally triggering the side effect.
- Forgetting that \`304 Not Modified\` responses have no body — code that assumes every "successful" response has JSON to parse will break on cache hits.
- Not setting \`Cache-Control\` at all, leaving caching behavior to browser defaults, which vary and aren't something you control.

### Best practices

- Terminate TLS as close to the client as reasonably possible (CDN edge) to shorten the handshake round trip.
- Prefer HTTP/2 or HTTP/3 for any API serving many small, concurrent requests (typical of modern frontends).
- Use \`ETag\`/\`If-None-Match\` for resources that change infrequently but are requested often.
- Set explicit \`Cache-Control\` headers rather than relying on defaults — be deliberate about what's cacheable and for how long.

### Performance considerations

- **Connection reuse** matters more than almost anything else for perceived latency — every new TCP+TLS handshake adds real round-trip time, which is why Keep-Alive (1.1) and multiplexing (2/3) exist at all.
- **HPACK/QPACK header compression** (HTTP/2 and HTTP/3 respectively) meaningfully reduces overhead for APIs where the same headers (auth tokens, user-agent) repeat on every request.
- On genuinely unreliable networks (mobile, satellite, rural), HTTP/3's per-stream loss recovery can be the single biggest latency win available, ahead of almost any application-level optimization.

### Security considerations

- Always serve over HTTPS — plaintext HTTP lets anyone on the network path read or modify traffic. \`Strict-Transport-Security\` (HSTS) tells browsers to never even attempt a plaintext connection to your domain again after the first visit.
- TLS certificate validation is what stops a man-in-the-middle from impersonating your server — never disable certificate verification in production code, even "temporarily."
- Be deliberate about \`Cache-Control: private\` vs \`public\` for anything containing user-specific data — a misconfigured shared cache can leak one user's response to another.

### Interview questions — beginner to senior

- **Beginner:** What's the difference between GET and POST? What does a 404 mean vs a 500?
- **Intermediate:** What does "idempotent" mean, and which HTTP methods are idempotent? What's the difference between \`301\` and \`302\`?
- **Advanced:** Walk through exactly what happens when you type a URL and hit Enter, from DNS to rendering.
- **Senior:** Why does HTTP/2 still suffer head-of-line blocking despite multiplexing? Why did HTTP/3 specifically choose UDP as its base rather than trying to patch TCP further? What real-world conditions (packet loss rate, RTT) make HTTP/3's advantage over HTTP/2 most pronounced?

### Related topics

TCP/IP fundamentals, TLS/SSL (§ Production Engineering), REST API design (§02), CDNs (§29), Caching (§13).

---

## 02 REST APIs

REST isn't a protocol or a library — it's a set of conventions for designing APIs around **resources** (nouns) instead of actions (verbs), so that once you learn how one endpoint in a REST API behaves, you can guess how the rest of them behave too. That predictability is the entire value proposition: \`/users/42\` combined with \`DELETE\` should mean "delete user 42" everywhere, in every API, without you needing to read custom documentation for each one.

### Why statelessness specifically matters here

Because each request in REST is expected to carry everything the server needs to understand it (auth token, all relevant params), any server instance can handle any request — which is what lets you put a load balancer in front of a fleet of identical servers and not worry about which one a given user's request lands on.

### Versioning — why you need it at all

APIs change, but you can't force every client to upgrade the instant you change something — mobile apps in particular can be stuck on old versions for months. Versioning lets you evolve the API while old clients keep working against the version they were built for.

\`\`\`
/api/v1/users        (URI versioning — simplest, most common, visible in every log line)
Accept: application/vnd.myapi.v2+json   (header versioning — cleaner URLs, less visible/debuggable)
\`\`\`

### Pagination — why offset pagination breaks at scale

\`?page=2&limit=20\` (offset pagination) is simple to implement, but under the hood the database still has to scan and discard the first N rows to get to your page — that gets slower as the offset grows. Worse, if rows are being inserted/deleted while someone pages through, they can see the same row twice or skip one entirely, because "page 2" is a moving target defined by position, not by identity. Cursor pagination fixes both: it says "give me everything _after_ this specific row," which is a stable position anchored to an actual row rather than a shifting offset.

\`\`\`
GET /orders?page=2&limit=20                  (offset — simple, degrades at scale, inconsistent under writes)
GET /orders?cursor=eyJpZCI6MTAwfQ&limit=20   (cursor — stable, scales, standard for infinite-scroll feeds)
\`\`\`

### Idempotency Keys — the pattern that stops double-charging

Here's the actual problem this solves: your client calls \`POST /payments/charge\`. The server processes the charge successfully — but the response gets lost on the way back (timeout, dropped connection, whatever). The client has no idea if the charge went through, so its retry logic — reasonably — tries again. Without anything to recognize "wait, I already did this," the server just runs the charge a second time, and the customer gets billed twice. POST is _not_ idempotent by default, which is exactly the gap idempotency keys are built to close.

The fix: the client generates a unique key (a UUID) _once_ per logical operation, sends it in a header, and reuses that _same_ key if it retries. The server's job is to remember "have I seen this key before" and, if so, hand back the original result instead of executing the logic again.

\`\`\`js
// idempotency.middleware.js
const redis = require("./redisClient");

async function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return res
      .status(400)
      .json({ error: "Idempotency-Key header is required" });
  }

  const cacheKey = \`idempotency:\${idempotencyKey}\`;
  const existing = await redis.get(cacheKey);

  if (existing) {
    // Seen this key before — replay the stored response instead of re-running the charge
    const cached = JSON.parse(existing);
    return res.status(cached.statusCode).json(cached.body);
  }

  // Lock the key immediately — this guards against a second request for the SAME key
  // arriving concurrently (e.g. a client that double-clicks "Pay" before the first
  // request even finishes), not just sequential retries.
  const acquired = await redis.set(
    cacheKey,
    JSON.stringify({ status: "processing" }),
    "NX",
    "EX",
    60,
  );
  if (!acquired) {
    return res.status(409).json({ error: "Request already in progress" });
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    redis.set(
      cacheKey,
      JSON.stringify({ statusCode: res.statusCode, body }),
      "EX",
      24 * 60 * 60, // keep the result around for 24h so even a late retry gets the original outcome
    );
    return originalJson(body);
  };

  next();
}

module.exports = idempotencyMiddleware;
\`\`\`

\`\`\`js
app.post("/payments/charge", idempotencyMiddleware, chargeController);
\`\`\`

The two-state design (short-lived "processing" lock, then a longer-lived "completed" result) is deliberate: the lock prevents two _simultaneous_ requests with the same key from both running the business logic, and the longer TTL on the final result means a retry that shows up hours later (a mobile client reconnecting after being offline) still gets the correct original response instead of a second charge. The exact same idea protects queue consumers from processing a redelivered message twice — see §21.

---

## 03 Node.js

### What is it?

Node.js is a JavaScript runtime — it takes the same language browsers run in your tab and lets you run it as a standalone server process, with access to the filesystem, network sockets, and everything else a backend needs that a browser sandbox normally blocks.

### Why do we need it? — the actual problem it was built to solve

Traditional server models (Apache's classic worker model, early Java servers) handled concurrency by spinning up a new **thread per connection**. Threads aren't free — each one costs real memory for its stack and adds context-switch overhead when the OS schedules between them. That's tolerable at low concurrency, but at thousands of simultaneous connections — and critically, the _vast majority_ of those connections are just sitting idle, waiting on a database query or a network response, not doing any actual CPU work — you're burning enormous resources just keeping mostly-idle threads alive.

Node's answer (released 2009, built on Chrome's V8 engine) was to flip the model: run your JavaScript on a **single thread**, and whenever something would block (reading a file, querying a database, calling another API), hand that operation off to the operating system or a background thread pool, and get notified via a callback/Promise once it's actually done. The single thread is never sitting there waiting — it's free to handle the next request in the meantime. This makes Node excellent for I/O-heavy workloads (typical REST APIs, real-time apps) and a poor fit for CPU-heavy work (image processing, heavy number crunching) — because CPU-bound code _does_ block that one thread, and there's no second thread quietly picking up the slack unless you explicitly ask for one via Worker Threads.

### History

Node was created in 2009 by Ryan Dahl, specifically frustrated by the thread-per-connection model and inspired by event-driven servers like Nginx. Its choice to build on V8 (rather than write a JS engine from scratch) is why Node tracks JavaScript language features closely — V8 improvements land in Node quickly. The npm package registry, launched alongside it, became the largest software package ecosystem in the world, which is arguably as responsible for Node's dominance as the runtime itself.

\`\`\`
JavaScript → V8 Engine → Node Runtime (bindings, Node APIs) → libuv (event loop, thread pool) → OS
\`\`\`

**V8** is the engine that actually compiles and executes your JavaScript (same engine Chrome uses). **libuv** is the C library underneath that gives Node its event loop and a thread pool — it's what actually talks to the OS for async file I/O, DNS, and some crypto operations that the OS itself can't do non-blocking.

### The Call Stack — what runs before any of this

Before talking about the event loop, it's worth being precise about what it's actually managing. The **call stack** is where your synchronous JavaScript actually executes, one frame at a time, LIFO (last in, first out) — a function call pushes a frame, returning pops it. JavaScript is single-threaded specifically because there's only _one_ call stack. Anything asynchronous (a \`setTimeout\`, a file read, a fetch) doesn't sit on the call stack while waiting — it's handed off to libuv/the browser, and only the _callback_ gets pushed onto the call stack once the operation actually completes and the event loop picks it up. This is the real answer to "why is Node single-threaded but still non-blocking": the _call stack_ is single-threaded, but the waiting happens somewhere else entirely.

### The Event Loop — what it's actually doing, phase by phase

The event loop is the mechanism that lets a single thread juggle many pending operations without blocking on any of them. On each pass, it walks through fixed phases, and each phase has its own queue of callbacks to run:

\`\`\`
   ┌───────────────────────┐
┌─>│        timers          │  setTimeout / setInterval callbacks whose time has come
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │   pending callbacks    │  I/O callbacks deferred from the previous loop iteration
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │      poll              │  waits for new I/O events and runs their callbacks — this is
│  │                        │  where most of your actual work (reading a file, a socket
│  │                        │  event) gets processed
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │      check             │  setImmediate() callbacks — designed to run right after poll
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤   close callbacks      │  cleanup, e.g. socket.on('close', ...)
   └────────────────────────┘
\`\`\`

### The nuance almost everyone gets wrong: microtasks are not a phase

It's tempting to slot \`process.nextTick()\` and resolved-\`Promise\` \`.then()\` callbacks (collectively called **microtasks**) into this diagram as if they were their own phase. They aren't, and treating them that way will give you the wrong mental model for ordering bugs.

What's actually happening: after **any single callback finishes running** — whether that's a timer callback, an I/O callback, anything — Node checks two queues before moving on to the next callback or the next phase: first the \`process.nextTick\` queue (fully drained), then the Promise microtask queue (fully drained). Only once _both_ are empty does Node continue with whatever callback or phase was next in line. This happens **between every single phase transition and after every single callback**, not once per full loop iteration — so microtasks can interleave many times within what looks like "one tick."

\`\`\`js
console.log("1: sync");

setTimeout(() => console.log("5: timer (macrotask - timers phase)"), 0);

setImmediate(() => console.log("6: immediate (macrotask - check phase)"));

Promise.resolve().then(() => console.log("3: promise microtask"));

process.nextTick(() => console.log("2: nextTick microtask - highest priority"));

console.log("1b: sync");

// Output order:
// 1: sync
// 1b: sync
// 2: nextTick microtask - highest priority   <- entire nextTick queue drains before anything else
// 3: promise microtask                        <- then the entire promise queue drains
// 5: timer (macrotask - timers phase)         <- only now does Node move to actual phases
// 6: immediate (macrotask - check phase)
\`\`\`

Why this matters in practice: if you recursively call \`process.nextTick\` inside a \`nextTick\` callback, you can literally starve the event loop — timers and I/O never get a chance to run because the microtask queue never empties. That's a real production bug, not a trivia question.

**The takeaway to say out loud in an interview:**

> The event loop has phases — timers, pending callbacks, poll, check, close. Microtasks aren't one of those phases; they drain completely in between every phase transition and after every callback, with \`nextTick\` always draining before Promises.

### Modules, Streams, and the concurrency primitives

\`\`\`js
// CommonJS — loaded synchronously, the original Node module system
const fs = require("fs");
module.exports = myFunction;

// ES Modules — loaded asynchronously, the modern standard
import fs from "fs";
export default myFunction;
\`\`\`

**Streams** exist because loading an entire large file (or response body) into memory before you can start processing it is wasteful and slow — a stream lets you process data in small chunks as they arrive, so memory usage stays flat regardless of the total size. \`Readable\` produces data, \`Writable\` consumes it, \`Duplex\` does both (like a TCP socket), and \`Transform\` is a duplex stream that modifies the data as it passes through (like a gzip compressor). \`.pipe()\` wires a readable into a writable, handling backpressure automatically so a fast producer doesn't overwhelm a slow consumer.

**Cluster vs Worker Threads** solve two different problems and it's a common interview mix-up. **Cluster** forks multiple _full Node processes_ (one per CPU core is typical), each with its own memory and its own event loop, and load-balances incoming connections across them — this is how you use multiple cores for an I/O-bound HTTP server, since one process's event loop can only use one core. **Worker Threads** give you true multi-threading _within_ a single process, sharing memory via \`SharedArrayBuffer\` — this is what you reach for when you have genuinely CPU-bound work (e.g., image resizing) that would otherwise block the main thread's event loop and stall every other request being handled by that process.

\`\`\`js
// Worker threads — offloading CPU-bound work off the main event loop
const { Worker, isMainThread, parentPort } = require("worker_threads");

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on("message", (result) => console.log("Result:", result));
} else {
  const heavyComputation = () => {
    /* CPU-bound work that would otherwise block the loop */ return 42;
  };
  parentPort.postMessage(heavyComputation());
}
\`\`\`

### Memory & Garbage Collection

V8 manages memory for you using a **generational garbage collector** — the core insight is that most objects die young (a request-scoped object is garbage the moment the response is sent), so V8 splits the heap into a small "young generation" (collected frequently, very fast — this is the "Scavenge" collector) and an "old generation" for objects that survive several collections (collected less often, but more thoroughly — "Mark-Sweep-Compact"). This is why allocating lots of short-lived objects per request is usually fine, but objects that accidentally live forever are the real danger.

**Memory leaks in Node usually come from one of a few repeat offenders**: event listeners added but never removed (each request attaching a new listener to a shared, long-lived emitter), closures unintentionally holding a reference to something large, or a cache with no eviction policy that just grows forever. Node exposes \`process.memoryUsage()\` and heap snapshots (via \`--inspect\` and Chrome DevTools) specifically to track these down — "my memory usage climbs steadily and never comes back down after GC" is the classic leak signature.

### Production story

> An API's response times were fine on average but had periodic latency spikes — every few minutes, p99 latency would jump from ~40ms to over 2 seconds for a handful of requests, then recover. The cause: a single endpoint was doing \`JSON.parse()\` on a large (multi-MB) payload synchronously. Because that parse is CPU-bound and runs entirely on the main thread, it blocked the event loop for the duration — every _other_ request being handled by that same process, completely unrelated to the large payload, stalled behind it until the parse finished. The fix was to move that specific parsing into a worker thread so it stopped blocking the shared event loop. The bigger lesson: in Node, one slow synchronous operation doesn't just slow down its own request — it slows down every concurrent request on that process, which is very different from a thread-per-request model where one slow request stays isolated.

### Common mistakes

- Doing CPU-heavy work (large JSON parsing, image processing, complex regex) synchronously on the main thread, blocking every concurrent request — see the production story above.
- Assuming \`process.nextTick\`/Promise microtasks are just "a fast setTimeout" — recursively scheduling them can starve the event loop entirely, since timers and I/O never get a turn until the microtask queue empties.
- Forgetting to remove event listeners on long-lived emitters, causing a slow memory leak that only shows up after the app's been running for hours or days.
- Not handling stream backpressure — writing to a slow destination faster than it can drain, which either buffers unboundedly in memory or silently drops data depending on how it's wired up.

### Best practices

- Keep the main thread free of CPU-bound work; offload it to Worker Threads or a separate background job (§20) instead.
- Use \`Cluster\` to use all CPU cores for I/O-bound HTTP workloads — one process's event loop only ever uses one core.
- Prefer streaming (\`.pipe()\`) over buffering entire files/payloads into memory when working with large data.
- Set memory limits and monitor \`process.memoryUsage()\` in production so a leak shows up as a graph trend, not a surprise crash.

### Performance considerations

- Node's throughput advantage comes specifically from I/O concurrency, not raw computation speed — benchmark accordingly; comparing Node to a compiled language on a CPU-bound task will make Node look bad for reasons that have nothing to do with how it's actually used in practice.
- \`Cluster\` mode roughly multiplies I/O-bound throughput by core count, but each process has its own memory (no shared in-memory cache across cores) — that's exactly why a shared cache like Redis is standard alongside Cluster, not an optional extra.

### Security considerations

- Never \`eval()\` or use the \`Function\` constructor on user input — same risk class as SQL injection, but for JavaScript execution itself.
- Watch for **ReDoS (Regular Expression Denial of Service)** — a maliciously crafted input against a poorly written regex can cause catastrophic backtracking that blocks the event loop for seconds or longer, taking down every concurrent request on that process, not just the one that submitted the input.
- Validate and sanitize any object built from user input before using it in operations like \`Object.assign\` or spreading into another object — unguarded merges can enable **prototype pollution**, where an attacker injects properties onto \`Object.prototype\` itself, affecting every object in the process.

### Interview questions — beginner to senior

- **Beginner:** Is Node.js single-threaded? What does that actually mean?
- **Intermediate:** What's the difference between the call stack and the event loop? What are the event loop's phases?
- **Advanced:** Explain exactly where \`process.nextTick\` and Promise microtasks fit relative to the event loop's phases, with an example.
- **Senior:** How would you diagnose and fix an event loop that's periodically blocked for 1-2 seconds in production? When would you reach for Cluster vs Worker Threads vs a separate background job service entirely, and why?

### Related topics

Call stack & call stack fundamentals, libuv internals, Streams API, Cluster module, Background Jobs (§20), V8 garbage collection tuning.

---

## 04 Express.js

### What is it?

Express is a minimal web framework sitting on top of Node's raw \`http\` module — it adds routing (matching a URL + method to a handler function) and a middleware chain (a pipeline of functions a request passes through before reaching that handler), and deliberately not much else.

### Why do we need it?

Node's built-in \`http\` module technically lets you build a server, but it hands you the raw request/response objects with almost nothing pre-solved — you'd manually parse URLs, match routes, parse request bodies, and handle errors from scratch, on every project. Express standardizes exactly that boilerplate into a small, composable API, without going as far as an opinionated framework that forces a specific folder structure, ORM, or validation library on you. That minimalism is precisely why almost every Node backend — regardless of its actual architecture — still ends up built on top of it: it gets out of the way rather than dictating how you should build.

### History

Express was released in 2010, modeled loosely on Sinatra (a similarly minimal Ruby framework). Its middleware-chain design became so influential that it's the pattern most other Node frameworks (Koa, NestJS, Fastify) either copy directly or explicitly differentiate from — understanding Express's middleware model is close to a prerequisite for understanding the Node framework ecosystem generally.

\`\`\`
src/
├── controllers/
├── routes/
├── middlewares/
├── services/
├── repositories/
├── config/
├── validators/
├── utils/
├── models/
└── app.js
\`\`\`

### Request lifecycle

\`\`\`
Request → Route → Middleware → Validation → Controller → Service → Repository → Database → Response
\`\`\`

### How it works internally — the middleware chain

Every incoming request walks through a chain of functions Express calls in the exact order they were registered with \`app.use()\`/\`app.get()\`/etc. Each function receives \`(req, res, next)\` and has three choices: call \`next()\` to pass control to the next function in the chain, end the response itself (\`res.json(...)\`, \`res.send(...)\`), or throw/call \`next(err)\` to jump straight to error-handling middleware. This is genuinely just a linked list of functions being called in sequence — nothing more magical than that — which is exactly why order matters so much (see Common Mistakes below) and why understanding it deeply demystifies almost every "why didn't my middleware run" bug.

\`\`\`
Incoming Request
      │
      ▼
   Helmet          (security headers)
      │
      ▼
   CORS            (cross-origin rules)
      │
      ▼
   Logger          (morgan/pino)
      │
      ▼
  Rate Limit        (abuse protection)
      │
      ▼
 Authentication      (who is this)
      │
      ▼
  Validation         (is the input well-formed)
      │
      ▼
  Controller  →  Service  →  Repository  →  Database
      │
      ▼
   Response
\`\`\`

### Syntax / API — Middleware, wired together

\`\`\`js
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet()); // sets secure headers by default, closes several common attack vectors in one line
app.use(cors({ origin: "https://myapp.com", credentials: true })); // controls which other origins are allowed to call this API from a browser
app.use(compression()); // gzip/brotli the response bodies — smaller payloads, faster page loads
app.use(morgan("combined")); // logs every request — first thing you want when debugging "why did this fail in prod"
app.use(express.json()); // parses JSON request bodies into req.body
app.use(cookieParser());

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // caps each IP at 100 requests / 15 min — the first line of defense against abuse

// Custom middleware — the pattern every auth/validation middleware follows
function requireAuth(req, res, next) {
  if (!req.headers.authorization)
    return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.get("/protected", requireAuth, (req, res) => res.json({ ok: true }));

// Error-handling middleware — Express recognizes this specifically because it has 4 arguments,
// and routes every error passed to next(err) here instead of crashing the process
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message });
});
\`\`\`

Order matters here — middleware runs top to bottom, so \`helmet()\` and \`cors()\` need to run before your routes, and the error handler has to be registered _last_ so Express knows it's the fallback for anything that throws.

### Real-world example — a router-level auth guard applied to a whole resource

\`\`\`js
// routes/orders.js — apply auth + validation once, at the router level,
// instead of repeating requireAuth in every single route below it
const router = express.Router();
router.use(requireAuth);

router.get("/", ordersController.list);
router.post("/", validate(createOrderSchema), ordersController.create);
router.delete("/:id", requireRole("admin"), ordersController.remove);

module.exports = router;

// app.js
app.use("/orders", require("./routes/orders"));
\`\`\`

### Production story

> A team added a new authenticated route but placed \`app.use(express.json())\` _after_ their route definitions instead of before, because it had always "just worked" in a different service where the order happened to be correct. \`req.body\` came back \`undefined\` on every POST to the new route — not an error, just silently empty, which took longer to trace than an outright crash would have, since nothing pointed directly at the missing body parser. The fix was one line moved above the route registrations. The broader lesson: because Express's middleware chain is just sequential function calls, a middleware can only affect requests that reach it _after_ it's registered — there's no retroactive application, and body-parsing, auth, and validation middleware in particular have to be registered before the routes that depend on them, every time, with no exceptions.

### Common mistakes

- Registering body-parsing (\`express.json()\`) or auth middleware _after_ the routes that need it — middleware only affects what comes after it in the chain.
- Forgetting to call \`next()\` in a middleware that isn't ending the response itself — the request just hangs forever with no response and no error.
- Registering the error-handling middleware (4-argument function) anywhere other than last — Express won't route errors to it correctly otherwise.
- Doing heavy synchronous work inside a middleware that runs on every request (e.g., an expensive computed header on every response) — this blocks the shared event loop for every concurrent request, not just the current one (see §03).

### Best practices

- Group related middleware at the router level (\`router.use(...)\`) rather than repeating it per-route.
- Keep controllers thin — parse the request, call the service layer, format the response; business logic belongs in the service layer (§00).
- Centralize error handling in one place rather than try/catching identically in every controller.
- Validate at the edge (§16) before any business logic runs, so downstream code can always trust \`req.body\`'s shape.

### Performance considerations

- Middleware order affects real latency, not just correctness — put cheap, request-rejecting checks (rate limiting, auth) before expensive ones (heavy validation, DB-backed checks) so bad requests are rejected as early and cheaply as possible.
- \`compression()\` trades a little CPU time for meaningfully smaller response payloads — usually a clear win for JSON APIs, but worth benchmarking for CPU-constrained services.

### Security considerations

- \`helmet()\` closes several header-based attack vectors in one line — there's rarely a good reason to omit it.
- Misconfigured \`cors()\` (e.g., \`origin: '*'\` combined with \`credentials: true\`) can open your API to cross-origin credentialed requests from any site — be explicit about allowed origins in production.
- Never expose raw error stack traces to API clients in production — the global error handler should log the full detail server-side and return a generic message to the client (see §18).

### Interview questions — beginner to senior

- **Beginner:** What is middleware in Express? What does \`next()\` do?
- **Intermediate:** How does Express know a function is error-handling middleware rather than regular middleware?
- **Advanced:** Why does middleware order matter, and what's a real bug that order mistakes can cause?
- **Senior:** How would you structure middleware for a large API with dozens of routes needing different combinations of auth, validation, and rate limiting, without duplicating logic across routers?

### Related topics

Node.js event loop (§03), Validation (§16), Error Handling (§18), Authentication (§10), Authorization (§11).

---

## 05 Databases

### What is it?

A database is the system responsible for storing your application's data durably and letting you query it back reliably — the layer everything else in your backend ultimately depends on.

### Why do we need it?

An application's data has to survive a server restart, be queryable in ways more complex than "read the whole file," and often needs to be shared safely across many concurrent requests without corrupting itself. A database is purpose-built for exactly that: durability, structured querying, and concurrency control, in ways a flat file or in-memory object never could be at any real scale.

### How it works — the core tradeoffs

Picking a database is really about picking which guarantees you need and which you're willing to give up — there's no universally "best" database, only the right tradeoff for your access pattern.

**SQL vs NoSQL** — SQL databases enforce a strict schema and relationships up front, which costs you flexibility but buys you strong consistency guarantees and the ability to run complex JOINs across related data. NoSQL databases relax the schema (documents can vary in shape) and often relax consistency too, in exchange for being easier to scale horizontally and faster to iterate on when your data model is still evolving.

**CAP Theorem** — in a distributed system, you can't simultaneously guarantee Consistency (every read sees the latest write), Availability (every request gets a response), and Partition tolerance (the system keeps working even if nodes can't talk to each other). The reason this ends up being framed as "pick 2 of 3" is a bit misleading, though — network partitions _will_ happen eventually in any real distributed system, so partition tolerance isn't really optional. The actual decision you're making is: when a partition happens, do you sacrifice consistency (keep serving, might return stale data) or availability (refuse to serve rather than risk an inconsistent answer)?

**ACID vs BASE** — ACID (Atomicity, Consistency, Isolation, Durability) is the guarantee that a transaction either fully happens or doesn't happen at all, and that concurrent transactions don't corrupt each other's view of the data — this is what SQL databases are built around, and it's why you reach for Postgres when correctness (money, inventory counts) matters more than raw throughput. BASE (Basically Available, Soft state, Eventually consistent) is the looser guarantee many NoSQL systems make instead: the system stays available and _will_ converge to a consistent state, just not necessarily instantly — a reasonable tradeoff when a few seconds of staleness (like a "like count" being slightly behind) genuinely doesn't matter.

**Isolation levels — the "I" in ACID, in practice.** ACID promises isolation, but _how much_ isolation is itself a dial, not a fixed guarantee, because full isolation on every transaction is expensive:

| Level                                 | Prevents                     | Still Allows                                                                                                                                    |
| ------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read Uncommitted**                  | Nothing meaningful           | Dirty reads (seeing another transaction's uncommitted changes)                                                                                  |
| **Read Committed** (Postgres default) | Dirty reads                  | Non-repeatable reads (re-reading the same row twice in one transaction can return different values if another transaction committed in between) |
| **Repeatable Read**                   | Dirty + non-repeatable reads | Phantom reads (a range query can return new rows that appeared from a concurrent insert)                                                        |
| **Serializable**                      | All of the above             | Nothing — behaves as if transactions ran one at a time, at the cost of the most contention/rollbacks                                            |

This table matters in interviews specifically because "just use Serializable everywhere" sounds safe but tanks throughput under real concurrency — the actual skill is picking the _loosest_ level that's still safe for a given operation (e.g., Read Committed is fine for most reads, but a "check balance then deduct" financial operation may genuinely need Serializable or explicit row locking to avoid a race condition).

**Normalization vs Denormalization** — normalizing (splitting data into related tables so nothing is duplicated) protects you from a very real bug class: if a user's name is stored in 5 places and you update one, the other 4 are now wrong. The cost is that reading a "complete" view of something now requires JOINing multiple tables. Denormalizing (duplicating data) flips that tradeoff: reads get faster and simpler because everything you need is in one place, but now you own the responsibility of keeping every copy in sync whenever it changes.

**Replication vs Sharding vs Partitioning** — these solve three different scaling problems, and mixing them up is a common interview stumble. Replication copies the _same_ data onto multiple nodes — its main purpose is redundancy (survive a node dying) and scaling _reads_ (route read queries to replicas). Sharding splits _different_ data across multiple independent database instances by some shard key — its purpose is scaling _writes_, since no single machine has to hold or write all the data. Partitioning is the same idea as sharding but usually refers to splitting a table into smaller physical chunks _within_ a single database instance (e.g., partitioning a huge \`orders\` table by month) — mainly for manageability and query performance, not for spreading load across machines.

\`\`\`
Application
    │
    ▼
Connection Pool         (reuses open connections — see below)
    │
    ▼
Primary Database ──────► Replica(s)     (replication: read scaling + redundancy)
    │
    ▼
Buffer Cache             (hot pages kept in memory, avoids disk I/O on every read)
    │
    ▼
Disk                     (durable storage — what survives a crash/restart)
\`\`\`

**Connection Pooling** — opening a new database connection isn't free: it's a TCP handshake plus, often, an authentication round trip, every single time. If you open a fresh connection per request, that overhead dominates on high-traffic APIs. A connection pool keeps a fixed number of connections open and hands them out to requests as needed, reusing them instead of paying that setup cost repeatedly — this is standard on any production backend.

### Real-world example

\`\`\`js
// Read Committed is fine here — just displaying data, staleness of a few ms doesn't matter
const orders = await db.query("SELECT * FROM orders WHERE user_id = $1", [
  userId,
]);

// A balance deduction needs stronger isolation — two concurrent requests decrementing
// the same balance must not both read the pre-deduction value and both "succeed"
await db.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
const { rows } = await db.query(
  "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
  [accountId],
);
if (rows[0].balance < amount) throw new AppError("Insufficient funds", 400);
await db.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [
  amount,
  accountId,
]);
await db.query("COMMIT");
\`\`\`

### Production story

> A flash-sale feature let users buy a limited-quantity item. Under normal traffic it worked fine, but during the actual flash sale — hundreds of concurrent purchase attempts within seconds — the item's stock count went negative. The bug: the "check stock, then decrement" logic ran under the database's default Read Committed isolation, so two concurrent requests could both read the same "1 item left" state before either had committed its decrement, and both would proceed to sell it. The fix was switching that specific operation to use \`SELECT ... FOR UPDATE\` (a row lock) so the second concurrent transaction had to wait for the first to fully commit before it could even read the current stock — turning what looked like a "just add more validation" bug into what it actually was: a concurrency/isolation problem that no amount of extra application-level \`if\` checks could have fixed, because the race condition existed _between_ the read and the write, not within either one alone.

### Common mistakes

- Treating isolation level as an afterthought — using the DB's default everywhere, then discovering a race condition only under real concurrent load (as in the story above).
- Confusing replication with backup — a replica that instantly mirrors every delete is not a backup; it will faithfully replicate a mistaken \`DROP TABLE\` just as fast as any legitimate write.
- Sharding too early, before you actually have a single-machine write bottleneck — it adds real complexity (cross-shard queries, rebalancing) that isn't worth paying for prematurely.
- Assuming "eventually consistent" means "consistent within milliseconds" — the actual convergence window depends entirely on your specific system's implementation and can be much longer under load.

### Best practices

- Default to the lowest isolation level that's actually safe for each specific operation, and reach for explicit row locks (\`FOR UPDATE\`) or Serializable only where a genuine race condition exists.
- Keep at least one true backup (point-in-time recovery or periodic snapshot) separate from replication — replicas protect against hardware failure, not human/logic error.
- Reach for sharding only once replication and vertical scaling of a single primary genuinely can't keep up with write volume.

### Performance considerations

- Connection pooling is close to free performance — it removes a real per-request cost (handshake + auth) that otherwise scales linearly with traffic.
- Stronger isolation levels increase lock contention and rollback rates under concurrency — Serializable transactions can fail and need retrying under load in a way Read Committed transactions simply don't.

### Security considerations

- Database credentials and connection strings should never be hardcoded — use environment variables or a secrets manager (see AWS §29).
- Principle of least privilege applies to DB users too — an application's DB user shouldn't have \`DROP TABLE\` permission if it only ever needs \`SELECT\`/\`INSERT\`/\`UPDATE\`.

### Interview questions — beginner to senior

- **Beginner:** What's the difference between SQL and NoSQL? What does ACID stand for?
- **Intermediate:** Explain the CAP theorem, and why "pick 2 of 3" is a slightly misleading framing.
- **Advanced:** What's the difference between Read Committed and Serializable isolation, and when would you actually need Serializable?
- **Senior:** Walk through diagnosing and fixing a race condition that caused a flash-sale item's stock to go negative under concurrent load, including why more application-level validation alone wouldn't have fixed it.

### Related topics

Indexes deep dive (§07), MVCC (§07), Sharding/Replication, Distributed Locking (System Design Patterns), Database Deep Dive chapter.

---

## 06 SQL

\`\`\`sql
-- Basic query
SELECT id, name, email FROM users WHERE created_at > '2025-01-01' ORDER BY created_at DESC;

-- JOINs — INNER only keeps rows that match on both sides; LEFT keeps everything from the
-- left table even if there's no match, filling the right side with NULLs.
-- Picking the wrong one is a classic source of "why did some rows disappear" bugs.
SELECT o.id, u.name
FROM orders o
INNER JOIN users u ON o.user_id = u.id;

SELECT o.id, u.name
FROM orders o
LEFT JOIN users u ON o.user_id = u.id;

-- GROUP BY + HAVING — GROUP BY collapses rows into groups, HAVING filters those groups
-- (WHERE can't do this because WHERE filters rows before grouping happens)
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;

-- Subquery — useful, but can be slow if the DB re-runs it per row; a JOIN is often faster
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- CTE — same as a subquery in spirit, but named and readable top-to-bottom,
-- which matters a lot once queries get complex
WITH high_value_orders AS (
  SELECT user_id, SUM(total) AS spend FROM orders GROUP BY user_id
)
SELECT * FROM high_value_orders WHERE spend > 5000;

-- Window function — lets you compute an aggregate (rank, running total) WITHOUT collapsing
-- rows the way GROUP BY does — you keep every row and just attach a computed value to it
SELECT
  user_id, total,
  RANK() OVER (PARTITION BY user_id ORDER BY total DESC) AS rank_by_user
FROM orders;
\`\`\`

**Views** are just saved queries you can query like a table — handy for hiding complexity, but they don't store data themselves (a materialized view does, at the cost of needing to be refreshed). **Triggers** run automatically on INSERT/UPDATE/DELETE — powerful, but overused triggers make it genuinely hard to trace "wait, what actually changed this row," so use them sparingly. **Deadlocks** happen when transaction A is holding a lock transaction B needs, while B is holding a lock A needs — neither can proceed. The database detects this cycle and forcibly aborts one of the transactions rather than let both hang forever; your application code needs to be ready to retry a transaction that got killed this way.

---

## 07 PostgreSQL

**JSONB** exists for the case where you want most of your schema strict (SQL's strength) but need one column that's genuinely flexible — like a \`metadata\` field that varies per row. Plain \`JSON\` in Postgres is stored as text and re-parsed every time you query it; \`JSONB\` is stored in a decomposed binary format that's slightly slower to _write_ but much faster to _query_, and — critically — it can actually be indexed, which plain JSON can't.

\`\`\`sql
SELECT * FROM events WHERE payload @> '{"type": "click"}';
CREATE INDEX idx_payload ON events USING GIN (payload);
\`\`\`

**GIN vs GiST indexes** — GIN is built for cases where a single column can contain many values to search within (JSONB keys, arrays, full-text search tokens); GiST is built for cases like geometric/spatial data or range types where "nearest neighbor" or "does this range overlap" queries matter more than exact matches.

**MVCC** is the mechanism that lets Postgres avoid the classic "readers block writers" problem: instead of locking a row so only one transaction can touch it, Postgres keeps multiple versions of a row and gives each transaction a consistent snapshot as of when it started. This is _why_ a long-running read query doesn't get blocked by (or block) a concurrent write — they're literally looking at different row versions.

**EXPLAIN ANALYZE** is the single most useful tool for query performance work — it doesn't just show you the _planned_ query strategy, it actually runs the query and shows real timing per step, so you can see exactly whether it used an index or fell back to a full table scan.

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
\`\`\`

**VACUUM** exists because of MVCC's downside: old row versions that are no longer visible to any active transaction still take up disk space until something cleans them up — that's what VACUUM does, reclaiming that dead space. If autovacuum falls behind on a high-write table, you'll see real performance degradation, which is a common production gotcha.

### Indexes — a full deep dive

#### What is it?

An index is a separate data structure the database maintains alongside a table, specifically built so it can locate matching rows without checking every single one.

#### Why do we need it?

Without an index, a query like \`WHERE user_id = 42\` forces the database to perform a **full table scan** — read every single row, check if it matches, discard it if not. That's fine at a thousand rows; at a hundred million rows, it's the difference between a query that returns instantly and one that takes minutes. Indexing trades a bit of write overhead and storage for a massive read speedup, by pre-organizing the data in a way that supports fast lookups.

#### How it works internally

**B-Tree** (the default, and by far the most common index type) organizes values into a balanced tree structure where every leaf is the same distance from the root — this is what guarantees lookups stay fast (logarithmic time) even as the table grows to millions of rows, instead of degrading the way a naive tree could.

\`\`\`
                    [ 50 ]
                 /          \\
          [ 20, 35 ]      [ 70, 90 ]
          /   |   \\         /   |   \\
      [..] [..]  [..]    [..] [..]  [..]   ← leaf nodes hold the actual
                                              row pointers, in sorted order
\`\`\`

Because the tree is sorted, B-Trees are excellent not just for exact matches (\`=\`) but for range queries (\`>\`, \`<\`, \`BETWEEN\`) and sorting (\`ORDER BY\`) too — the database can walk the tree and read off a contiguous range directly, without touching unrelated data.

**Hash indexes** trade that range-query flexibility for raw speed on _exact-match-only_ lookups — a hash index computes a hash of the value and jumps straight to the matching bucket, which can be marginally faster than a B-Tree for pure equality checks, but it's useless for \`>\`/\`<\`/\`ORDER BY\` since hashing destroys the original ordering. This is exactly why B-Tree remains the default even though hash indexes exist — most real queries eventually want range or sort support too, and B-Tree does both reasonably well.

**Composite (multi-column) indexes** — the _order_ of columns in the index matters enormously, and is one of the most common practical mistakes. An index on \`(user_id, created_at)\` can efficiently serve a query filtering on \`user_id\` alone, or on \`user_id\` _and_ \`created_at\` together — but it generally can't efficiently serve a query filtering on \`created_at\` alone, because the index is sorted by \`user_id\` first. Think of it like a phone book sorted by last name then first name: it's great for "find everyone with last name Smith" and "find Smith, John," but useless for "find everyone with first name John" — you'd still have to scan the whole thing.

**Covering indexes** go a step further: if an index includes _every column_ a query actually needs (not just the filter column, but the selected columns too), the database can answer the query directly from the index itself, without ever touching the underlying table — this is called an "index-only scan," and it's meaningfully faster because it skips a whole extra read step.

**Clustered vs non-clustered** — a clustered index determines the _physical_ on-disk order of the table's rows (there can only be one per table, since rows can only be physically sorted one way); a non-clustered index is a separate structure that just points back to where the actual row lives. Postgres doesn't really have "clustered" indexes in the way SQL Server or MySQL's InnoDB do by default (its primary key isn't automatically clustered), which is a genuine, commonly-tested difference between database engines.

#### Syntax / API

\`\`\`sql
CREATE INDEX idx_user_id ON orders (user_id);                          -- basic B-Tree index
CREATE INDEX idx_user_created ON orders (user_id, created_at);         -- composite — column order matters
CREATE INDEX idx_covering ON orders (user_id) INCLUDE (total, status); -- covering index
CREATE UNIQUE INDEX idx_email ON users (email);                        -- also enforces uniqueness
\`\`\`

#### Real-world / production example

\`\`\`sql
-- Before: no index on user_id — full table scan on a 10M row table
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Seq Scan on orders  (cost=0.00..185000.00 rows=10 width=120) (actual time=0.02..8200.14 rows=8 loops=1)
--   Filter: (user_id = 42)
--   Rows Removed by Filter: 9999992
-- Planning Time: 0.1 ms
-- Execution Time: 8201.3 ms   <- ~8.2 SECONDS

CREATE INDEX idx_orders_user_id ON orders (user_id);

EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Index Scan using idx_orders_user_id on orders  (cost=0.43..8.5 rows=10 width=120) (actual time=0.015..0.021 rows=8 loops=1)
--   Index Cond: (user_id = 42)
-- Planning Time: 0.1 ms
-- Execution Time: 0.03 ms    <- ~20 MICROSECONDS
\`\`\`

#### Production story

> A dashboard endpoint aggregating a user's order history was timing out under load, taking upwards of 8 seconds per request on a table that had grown to around 10 million rows over a year of production traffic — it had worked fine at launch when the table was small, and nobody had revisited it since. \`EXPLAIN ANALYZE\` showed a full sequential scan filtering \`user_id\` out of 10 million rows to find a handful of matches. Adding a single index on \`user_id\` dropped the query from ~8 seconds to under 1 millisecond — a genuine ~400,000x improvement, not an exaggeration, because the access pattern went from "read every row" to "walk directly to the eight matching rows." The broader lesson: an index that seems unnecessary at launch can become the single biggest performance bottleneck in the system purely as data grows, with zero code changes — which is exactly why \`EXPLAIN ANALYZE\` should be a standard step before shipping any query that will run against a growing table, not just a debugging tool reached for after something's already slow.

#### Common mistakes

- Indexing every column "just in case" — every index adds write overhead (every INSERT/UPDATE/DELETE has to update it too) and storage, so indexes should be added deliberately based on actual query patterns, not defensively.
- Wrapping an indexed column in a function in the \`WHERE\` clause (e.g., \`WHERE LOWER(email) = 'x'\`) — this prevents the standard index from being used at all, since the index stores the raw column values, not the function's output (fixable with a functional/expression index specifically on \`LOWER(email)\`).
- Getting composite index column order backwards relative to actual query patterns — an index on \`(created_at, user_id)\` won't efficiently serve \`WHERE user_id = 42\` alone.
- Not revisiting indexing decisions as a table grows — a missing index is invisible at 10,000 rows and catastrophic at 10 million, exactly as in the production story above.

#### Best practices

- Index columns that appear in \`WHERE\`, \`JOIN\`, and \`ORDER BY\` clauses of your actual hot-path queries — driven by real query patterns, not guesswork.
- Run \`EXPLAIN ANALYZE\` on any query touching a table expected to grow, before it becomes a production incident.
- Prefer a composite index over multiple single-column indexes when queries commonly filter on the same combination of columns together.
- Periodically review and drop unused indexes — they cost write performance and storage for no read benefit if nothing actually queries against them.

#### Performance considerations

- Every index roughly doubles (or more) the write cost for that table, since each write has to update both the table and every index on it — this is the direct tradeoff for the read speedup.
- Index-only scans (via covering indexes) avoid an extra disk read back to the table, which matters more the larger the table and the colder the cache.

#### Security considerations

- Indexes don't introduce new vulnerabilities directly, but query plans exposed via verbose error messages (or an exposed \`EXPLAIN\` endpoint) can leak schema/index structure to an attacker doing reconnaissance — treat detailed DB error output as internal-only, never surface it directly to API clients.

#### Interview questions — beginner to senior

- **Beginner:** What is an index, and why does it speed up reads?
- **Intermediate:** Why does adding an index slow down writes? When would you choose _not_ to add one?
- **Advanced:** Explain why composite index column order matters, with an example query it would and wouldn't help.
- **Senior:** Walk through what \`EXPLAIN ANALYZE\` output tells you, and how you'd decide between a B-Tree, GIN, or covering index for a specific slow query you're handed.

#### Related topics

Query planner internals, MVCC (above), Sharding/Partitioning (§05), Read Replicas, Database Deep Dive chapter.

---

## 08 MongoDB

MongoDB stores data as flexible JSON-like documents (BSON under the hood) instead of rigid rows, which is genuinely useful when your data doesn't naturally fit a fixed set of columns — think user-generated content, event logs, or anything whose shape evolves as the product does.

\`\`\`js
// Aggregation pipeline — MongoDB's answer to SQL's JOIN + GROUP BY, expressed as a
// sequence of stages the data flows through, each one transforming it further
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
]);
\`\`\`

**Indexes** work the same conceptually as SQL — but with compound indexes, the _order_ of fields in the index has to match how your queries filter/sort, or the index won't get used the way you expect; this trips people up constantly.

**Replication (replica sets)** — one primary node accepts writes, secondaries replicate from it, and if the primary goes down, the replica set automatically elects a new primary — this is what gives you both redundancy and read scaling (you can route reads to secondaries).

**Transactions — the assumption worth correcting.** A very common (and outdated) belief is "MongoDB doesn't have real transactions, so use Postgres if you need them." That was true a long time ago, but MongoDB has supported **multi-document ACID transactions since version 4.0, released in 2018**, and extended that across sharded clusters in 4.2. So "I need transactions" is no longer, by itself, a reason to rule Mongo out — the better question is about your data's _shape_ and _write pattern_, which is exactly the corrected decision tree in the Bonus section below.

\`\`\`js
const session = client.startSession();
session.startTransaction();
try {
  await accounts.updateOne(
    { _id: fromId },
    { $inc: { balance: -amount } },
    { session },
  );
  await accounts.updateOne(
    { _id: toId },
    { $inc: { balance: amount } },
    { session },
  );
  await session.commitTransaction();
} catch (e) {
  await session.abortTransaction(); // if either update fails, roll back both — no half-completed transfer
} finally {
  session.endSession();
}
\`\`\`

---

## 09 ORMs

An ORM exists to close the gap between how you think in code (objects, classes) and how relational data is actually stored (rows, foreign keys) — without it, you're hand-writing SQL strings everywhere, which is both tedious and a common source of SQL injection bugs if done carelessly.

| ORM           | Ecosystem | Style                                                                                                                                                                                         |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**    | Node/TS   | Schema-first — you define your schema in a dedicated file, and it generates a fully type-safe client from it, catching mismatches at compile time rather than at runtime                      |
| **TypeORM**   | Node/TS   | Decorator-based — you annotate classes directly to define the schema, supports both ActiveRecord (model manages itself) and DataMapper (separate repository) styles                           |
| **Sequelize** | Node/JS   | The older, mature option — model-based, huge ecosystem, less type-safety by default                                                                                                           |
| **Mongoose**  | MongoDB   | Adds an enforced schema layer on top of MongoDB's naturally schemaless documents — useful because "totally flexible" data often turns into "totally inconsistent" data without some structure |

\`\`\`js
const user = await prisma.user.create({
  data: { name: "Rupesh", email: "r@example.com" },
});

// Repository pattern — wrapping the ORM behind your own interface, so your service
// layer doesn't depend directly on Prisma/TypeORM/whatever — see §00 for why this matters
class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }
  async create(data) {
    return prisma.user.create({ data });
  }
}
\`\`\`

**Migrations** exist because your schema changes over time, and you need those changes to be version-controlled and reproducible across every environment (your laptop, staging, production) — running a migration script is far safer than manually running ALTER TABLE by hand on production. **Seeders** populate a fresh database with baseline/test data so a new developer (or a test suite) doesn't start from a completely empty DB.

---

## 10 Authentication

### What is it?

Authentication answers one question: **who is this?** It's easy to conflate with authorization (§11), but they're genuinely separate concerns — you can be authenticated (I know who you are) without being authorized to do a specific thing.

### Why do we need it? — the problem, and why passwords alone were never enough

Any system that stores or acts on behalf of specific people needs a reliable way to confirm "this request really is from who it claims to be from" — without that, anyone could claim to be anyone. Passwords were the first widely-used answer, but they age badly as a _sole_ mechanism: people reuse the same password across dozens of services, so one breached, unrelated site can compromise accounts everywhere else; passwords can be phished by a convincing fake login page; and a database leak of even _hashed_ passwords still lets attackers run offline cracking attempts against weak ones. This is exactly why the field moved toward layering more mechanisms on top of (or instead of) a password: multi-factor authentication, short-lived tokens instead of long-lived credentials sent on every request, and increasingly, passwordless approaches like passkeys.

### History — the rough evolution

**Sessions + cookies** (server holds state) → **JWT/stateless tokens** (server holds nothing, token is self-verifying) → **OAuth/OIDC** (delegate identity to a trusted third party instead of managing passwords yourself) → **Passkeys/WebAuthn** (cryptographic key pairs replacing passwords entirely, phishing-resistant by design). Each step was a response to a real limitation of the previous one — sessions don't scale statelessly, JWTs are hard to revoke, and even OAuth still ultimately depends on _some_ provider's password unless passkeys are used.

**Session-based auth** keeps the actual user state on the server — when you log in, the server creates a session record (in memory or in Redis) and gives your browser just an opaque session ID in a cookie. Every request, the server looks up that ID to figure out who you are. This is easy to revoke instantly (just delete the session record) but means every server instance needs access to the same session store — it's inherently stateful.

**JWT (JSON Web Token)** flips this: the token itself _is_ the proof, self-contained and cryptographically signed. The server can verify it's genuine just by checking the signature — no database lookup required — which is what makes JWTs a natural fit for stateless, horizontally-scaled APIs. The tradeoff is revocation: since the server isn't tracking issued tokens, you can't instantly invalidate one that's already out in the wild (a leaked or stolen token stays valid until it expires). This is why access tokens are kept short-lived, and paired with a longer-lived refresh token that's used specifically to mint new access tokens — limiting how long a compromised access token stays dangerous.

\`\`\`js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Never store plaintext passwords — bcrypt hashes with a built-in salt, so even if your
// DB leaks, an attacker can't just read passwords straight out of it
const hashed = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(password, user.hashedPassword);

const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: "15m",
});
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" },
);

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // throws if signature/expiry is invalid
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
\`\`\`

### Refresh token rotation, logout, and token theft

A refresh token sitting around for 7+ days is a real target — if it's ever stolen (XSS, a compromised device, a leaked log), an attacker can keep minting new access tokens indefinitely. **Refresh token rotation** closes this: every time a refresh token is used to get a new access token, the server also issues a _brand new_ refresh token and immediately invalidates the old one. If a stolen refresh token is ever used _after_ the legitimate client has already rotated past it, the server can detect that reuse and treat it as a signal of theft — revoking the entire token family and forcing a re-login.

\`\`\`js
async function refreshAccessToken(oldRefreshToken) {
  const stored = await db.refreshTokens.findOne({ token: oldRefreshToken });

  if (!stored || stored.revoked) {
    // Reuse of an already-rotated-away token — likely theft. Kill the whole session family.
    await db.refreshTokens.revokeFamily(stored?.familyId);
    throw new Error("Token reuse detected — all sessions revoked");
  }

  await db.refreshTokens.revoke(stored.id); // old one is now dead, one-time use only

  const newAccessToken = jwt.sign(
    { userId: stored.userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
  const newRefreshToken = crypto.randomUUID();
  await db.refreshTokens.create({
    token: newRefreshToken,
    userId: stored.userId,
    familyId: stored.familyId,
  });

  return { newAccessToken, newRefreshToken };
}
\`\`\`

**Logout** is trivial with sessions (delete the server-side record) but genuinely awkward with pure JWTs — since the server isn't tracking issued tokens, "logging out" a JWT that's still technically valid requires either keeping a server-side blocklist of revoked tokens (which reintroduces the statefulness JWTs were meant to avoid) or simply relying on the access token's short expiry to naturally end the session soon after — which is exactly why access tokens are kept short-lived in the first place.

**Where to store tokens client-side** is a genuinely debated tradeoff, not a solved problem: \`localStorage\` is readable by any JavaScript running on the page, so if an attacker manages to inject a script (XSS), they can steal the token directly — but it's simple and works across tabs easily. An \`HttpOnly\` cookie can't be read by JavaScript at all, closing that specific theft vector, but opens the door to CSRF instead (mitigated with \`SameSite\`, see §12) and needs careful handling for cross-origin setups (mobile apps, multiple frontend domains). There's no universally "correct" answer — it's a tradeoff between which specific attack surface you're more exposed to.

### OAuth & OIDC — delegated identity, not your own login system

**OAuth** solves a different problem than logging into _your_ app — it's about letting a _third-party app_ access your data on _another_ service (like "let this app see my Google Calendar") without ever handing that app your Google password. The flow: your app redirects the user to Google, the user approves a specific scope of access, Google redirects back with an authorization code, and your server exchanges that code for an access token it can use to call Google's APIs on the user's behalf — your app never sees the user's actual Google password.

**OIDC (OpenID Connect)** is built _on top of_ OAuth specifically to answer "who is this person," rather than just "what can this app access." This is the actual mechanism behind "Sign in with Google" / "Sign in with GitHub" buttons — OIDC adds a standardized identity token (containing the user's verified email, name, etc.) on top of OAuth's access-delegation flow, so you can use it as a login system, not just for API access delegation.

\`\`\`
Browser → "Sign in with Google" → Redirect to Google's consent screen
   → User approves → Google redirects back with an authorization code
   → Your server exchanges the code (server-side, using a client secret)
     for an access token + an ID token (OIDC)
   → Your server verifies the ID token's signature, extracts the user's
     verified email, and creates/looks up the local user record
   → Your server issues its OWN session/JWT for your app going forward
\`\`\`

**Magic links** (email a one-time login link instead of a password) and **MFA** (a second factor — an authenticator app code, an SMS code) both exist to reduce reliance on a password being the _only_ thing standing between an attacker and an account. **Passkeys (WebAuthn)** go further and remove the shared secret entirely: the device generates a public/private key pair, the private key never leaves the device, and the server only ever stores the public key — there's no password or shared secret to phish or leak in a breach, which is what makes passkeys phishing-resistant by design rather than just "another factor."

### Production story

> An app used JWTs stored in \`localStorage\`, with a 7-day expiry and no rotation. During a routine dependency audit, a third-party analytics script included via npm was found to have been compromised upstream and was exfiltrating \`localStorage\` contents — including auth tokens — for a subset of users. Because tokens lived for a full week and weren't rotated, every token stolen during the compromise window remained valid and usable for up to 7 days after the incident was found and the malicious script removed. The response: shorten access token lifetime significantly, move to \`HttpOnly\` cookies for refresh tokens so client-side JavaScript (including any injected/compromised script) could never read them directly, and add refresh token rotation with reuse detection so a stolen refresh token would trip a theft alarm on its first illegitimate use rather than silently working for days. The lesson: token storage and lifetime decisions aren't theoretical — they define your actual blast radius when something you don't control (a third-party script, a dependency) goes wrong.

### Common mistakes

- Storing long-lived tokens in \`localStorage\` without understanding that any injected script (via XSS or a compromised dependency) can read them directly.
- Not rotating refresh tokens, meaning a single stolen refresh token stays valid for its entire lifetime with no way to detect the theft.
- Treating "the request has a valid JWT" as equivalent to "this user is authorized to do this" — authentication and authorization are separate checks (see §11).
- Rolling your own OAuth implementation instead of using a well-tested library — the flow has enough subtle steps (state parameter for CSRF protection, PKCE for public clients) that hand-rolling it is a common source of real vulnerabilities.

### Best practices

- Keep access tokens short-lived (minutes), refresh tokens longer-lived but rotated on every use with reuse detection.
- Store refresh tokens in \`HttpOnly\`, \`Secure\`, \`SameSite\` cookies where possible rather than \`localStorage\`.
- Use MFA at minimum for any account with elevated privileges (admin roles); consider passkeys for new systems where phishing resistance matters most.
- Always verify OIDC ID tokens' signature and issuer server-side — never trust claims from a token you haven't cryptographically verified.

### Performance considerations

- JWT verification is CPU-bound (signature check) but requires no database round trip — this is the actual performance win over sessions at scale, since it removes a network hop from every authenticated request.
- Session lookups against a shared store (Redis) add latency per request but are still fast in practice (~1ms) — the real cost shows up under very high request volume where that shared store becomes a bottleneck to scale.

### Security considerations

- Never store passwords in plaintext or with reversible encryption — always a strong, salted hash (bcrypt/argon2), see §12.
- Assume any token is eventually compromised somehow — the real design question is _how much damage_ a compromised token can do, which is exactly what short expiry + rotation are built to limit.
- Validate the \`state\` parameter in OAuth flows to prevent CSRF against the OAuth callback itself, and use PKCE for any client that can't securely hold a client secret (mobile apps, SPAs).

### Interview questions — beginner to senior

- **Beginner:** What's the difference between authentication and authorization? What does bcrypt do?
- **Intermediate:** JWT vs session — what are the actual tradeoffs, not just the definitions?
- **Advanced:** How would you implement secure logout with JWTs, given the server isn't tracking issued tokens by default?
- **Senior:** Design a refresh token rotation scheme that can detect token theft. Walk through the full OAuth + OIDC flow for "Sign in with Google," including where a state parameter and PKCE matter and why.

### Related topics

Authorization/RBAC (§11), Security fundamentals (§12), Sessions & Redis, Passkeys/WebAuthn, Rate limiting on auth endpoints.

---

## 11 Authorization

### What is it?

If authentication is "who are you," authorization is "**what are you allowed to do now that I know who you are**."

### Why do we need it?

Knowing someone's identity tells you nothing about what they should be permitted to do — a logged-in regular user and a logged-in admin are both "authenticated," but should clearly not have access to the same actions. Conflating the two checks is a genuinely common and serious security bug: verifying a token is valid (authentication) is not the same as verifying _this specific user_ is allowed to delete _this specific resource_ (authorization) — an endpoint can be perfectly secured against unauthenticated access while still letting any logged-in user delete anyone else's data, if the authorization check was simply never written.

### How it works — the main models

**RBAC (Role-Based Access Control)** is the most common approach: you don't assign permissions to individual users one by one (that doesn't scale past a handful of users), you assign users to roles, and permissions to roles. Give someone the \`admin\` role and they inherit everything admins can do. Simple to reason about and audit, but can get awkward once permissions don't map cleanly onto a small, fixed set of roles — e.g., "editors who can also approve payments over $500" starts to strain a purely role-based model.

**ABAC (Attribute-Based Access Control)** is more flexible: the decision depends on _attributes_ evaluated at request time — is this user the owner of the resource, is it currently business hours, what department are they in, what's the resource's current status. This handles cases RBAC struggles with (like "users can edit their own posts but not others'") without needing a separate role invented for every possible condition.

\`\`\`
Request → Extract user + resource + action → Evaluate policy → Allow / Deny
   e.g. "Can user 42 DELETE order 917?"
        → Is user 42 an admin? OR
        → Is user 42 the owner of order 917 AND order 917.status == 'draft'?
\`\`\`

### Syntax / API

\`\`\`js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" }); // 403, not 401 — we know who they are, they're just not allowed
    }
    next();
  };
}

app.delete(
  "/admin/users/:id",
  verifyToken,
  requireRole("admin"),
  deleteUserController,
);

// Resource-level (ownership) check — RBAC alone can't express this; needs an ABAC-style check
async function requireOwnership(req, res, next) {
  const order = await orderRepository.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  req.order = order; // avoid a second DB lookup in the controller
  next();
}
\`\`\`

### Real-world example

A SaaS billing endpoint (\`DELETE /orders/:id\`) needs _both_ checks stacked: \`verifyToken\` (authentication — is this a real, logged-in user) then \`requireOwnership\` (authorization — do they specifically own this order, or are they an admin). Skipping the second check is the classic **IDOR (Insecure Direct Object Reference)** vulnerability — a valid, authenticated user simply changes the \`:id\` in the URL and deletes someone else's resource, because only identity was checked, not ownership.

### Production story

> A penetration test found that an authenticated regular user could fetch \`GET /api/invoices/:id\` for _any_ invoice ID, not just their own, by simply incrementing the ID in the URL — the endpoint checked \`verifyToken\` (you're logged in) but never checked that the invoice actually belonged to the requesting user. This is a textbook IDOR: the bug wasn't a broken authentication system at all, it was a _missing_ authorization check layered on top of a perfectly working one. The fix was a single added ownership check, but the incident review process afterward added an explicit rule: no route touching a specific resource by ID ships without an accompanying ownership/role check in the same PR, checked in code review as its own line item — because it's exactly the kind of gap that's invisible in a quick glance at "does auth work" and only shows up when someone deliberately tests for it.

### Common mistakes

- Checking authentication and assuming authorization is "handled" by the same check — they are not the same thing, and conflating them causes IDOR vulnerabilities.
- Doing authorization checks only in the frontend/UI (hiding a delete button) without enforcing them server-side — client-side checks are a UX nicety, never a security boundary.
- Hardcoding role checks scattered across controllers instead of centralizing them in middleware, making it easy to forget one on a new endpoint.

### Best practices

- Enforce authorization server-side on every request that touches a specific resource, never relying on the client to "not ask" for things it shouldn't see.
- Centralize permission logic (middleware, a policy layer) rather than duplicating \`if (user.role !== 'admin')\` checks inline across many controllers.
- Default to deny — an endpoint should require an explicit permission grant, not accidentally allow access because no check was written.

### Performance considerations

- ABAC-style ownership checks that require a DB lookup add a query per request — cache the resource fetch and pass it along (as in \`requireOwnership\` above) rather than fetching it twice (once to authorize, once in the controller).

### Security considerations

- IDOR (as in the production story) is one of the most common real-world API vulnerabilities precisely because it's invisible in a superficial security review — the endpoint "has auth," just not the _right_ auth.
- Always return \`403 Forbidden\` (not \`404 Not Found\`) when you want to be explicit that a resource exists but access is denied — though for genuinely sensitive resources, returning \`404\` for both "doesn't exist" and "not yours" can be a deliberate choice to avoid confirming a resource's existence to an unauthorized party.

### Interview questions — beginner to senior

- **Beginner:** What's the difference between authentication and authorization?
- **Intermediate:** What's RBAC, and where does it start to break down?
- **Advanced:** What is an IDOR vulnerability, and how do you prevent it systematically across a large API?
- **Senior:** Design an authorization system for a multi-tenant SaaS product where users can have different roles per organization they belong to.

### Related topics

Authentication (§10), Security (§12), Multi-tenancy patterns, Policy engines (OPA-style ABAC).

---

## 12 Security

### What is it?

Application security is the practice of closing specific, well-understood gaps between what your system trusts and what it should verify — each vulnerability below exists because of a concrete gap in trust, and the fix always closes that specific gap.

### Why do we need it?

Any system that accepts input from the outside world (which is every backend) is implicitly trusting that input to some degree unless it's explicitly validated or escaped — and attackers specifically look for the places that trust was assumed rather than verified. Understanding security as "specific trust gaps, each with a specific fix" rather than a vague checklist is what actually lets you reason about _new_ vulnerabilities you haven't memorized yet, not just the ones on this list.

### How it works — the core vulnerability classes

**XSS (Cross-Site Scripting)** happens when user-supplied input gets rendered back into a page _as if it were trusted HTML/JS_ — e.g., a comment containing \`<script>\` actually executes in other users' browsers. The fix is to never trust that input is safe to render raw: encode output, and set a Content-Security-Policy header restricting which scripts are even allowed to run at all, as defense in depth.

**CSRF (Cross-Site Request Forgery)** exploits the fact that browsers automatically attach cookies to _any_ request to a domain, even one triggered by a malicious site you happen to have open in another tab. So a hidden form on \`evil.com\` can silently submit a request to \`yourbank.com\`, and your browser happily attaches your login cookie. \`SameSite\` cookies close this by telling the browser "don't attach this cookie to requests that originated from a different site" — which is why modern apps rarely need explicit CSRF tokens anymore if \`SameSite=Strict/Lax\` is set correctly.

**SQL Injection** happens when user input gets concatenated directly into a SQL string, letting an attacker inject their own SQL logic. Parameterized queries fix this at the root — the database treats the input strictly as _data_, never as executable SQL, no matter what characters are in it.

\`\`\`js
// VULNERABLE — string concatenation lets an attacker close the quote and inject their own SQL
db.query(\`SELECT * FROM users WHERE email = '\${email}'\`); // email = "' OR '1'='1" returns every user

// SAFE — the database engine keeps the query structure and the values completely separate;
// there's no way for $1 to be interpreted as SQL syntax, however it's crafted
db.query("SELECT * FROM users WHERE email = $1", [email]);
\`\`\`

**Brute force / rate limiting** — without a limit, an attacker can just try millions of password guesses against your login endpoint. Rate limiting (and lockouts after N failed attempts) makes that approach too slow to be practical.

### Real-world example — layered defenses on one endpoint

\`\`\`js
app.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // brute-force mitigation
  validate(loginSchema), // reject malformed input early
  async (req, res) => {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      req.body.email,
    ]); // parameterized — no injection
    // ... bcrypt.compare, issue tokens, set HttpOnly + Secure + SameSite cookie
  },
);
\`\`\`

### Production story

> A community forum feature let users submit a display name shown next to their posts, rendered directly into the page without escaping. An attacker set their display name to a \`<script>\` payload that read other visitors' session cookies and sent them to an external server whenever anyone viewed a thread containing their posts — a classic stored XSS, and a particularly dangerous variant because it didn't require tricking any specific victim into clicking anything; simply viewing the page was enough. The immediate fix was output-encoding all user-generated content before rendering; the longer-term fix was adding a Content-Security-Policy header restricting script sources, specifically so that _even if_ an escaping bug slipped through again in the future, an injected inline script still wouldn't be allowed to execute. That's the real argument for defense in depth: assume any single layer can fail, and don't let one missed escape call become a full account-takeover vector.

### Common mistakes

- Trusting client-side validation as a security boundary — it's a UX nicety; the server must independently validate/authorize everything, since a client can always be bypassed.
- String-concatenating user input into SQL, shell commands, or HTML instead of using parameterized queries / proper escaping.
- Storing passwords with fast, general-purpose hashes (MD5, SHA-256) instead of purpose-built slow hashes (bcrypt, argon2) designed specifically to resist offline cracking.
- Returning verbose error messages/stack traces to API clients, leaking internal structure useful for an attacker doing reconnaissance.

### Best practices

- Validate and sanitize all external input at the boundary (§16), and treat everything from a client as untrusted, always.
- Use parameterized queries / ORMs for all database access, never raw string concatenation.
- Set \`Helmet\`, a strict CSP, and correct cookie flags (\`HttpOnly\`, \`Secure\`, \`SameSite\`) as a baseline on every project, not an afterthought.
- Rate-limit authentication and other sensitive endpoints specifically, not just globally.

### Performance considerations

- Security controls (hashing, rate-limit checks, TLS) all cost some CPU/latency — bcrypt in particular is deliberately slow (that's the point, to resist brute force), so it should never run on a hot path beyond login/password-change flows.

### Security considerations

_(this entire chapter is security considerations — see above)_

### Interview questions — beginner to senior

- **Beginner:** What is SQL injection, and how do parameterized queries prevent it?
- **Intermediate:** What's the difference between XSS and CSRF? How does \`SameSite\` help with CSRF specifically?
- **Advanced:** Explain stored vs reflected vs DOM-based XSS, and how CSP provides defense in depth even after an escaping bug.
- **Senior:** Design a layered security posture for a public-facing API handling payments — walk through input validation, auth, rate limiting, and what you'd log vs never log.

### Related topics

Authentication (§10), Authorization (§11), Validation (§16), HTTP headers/cookies (§01).

---

## 13 Caching

### What is it?

Caching is storing the result of an expensive operation (a database query, a computation, an external API call) somewhere fast to access, so a repeat request for the same thing doesn't have to redo that work.

### Why do we need it?

Most applications have data that's read far more often than it changes — a product page, a user's profile, a popular query result. Recomputing or re-fetching that same answer from the database on every single request is wasteful once traffic grows: the database becomes the bottleneck long before your application servers do, since it's typically the hardest layer to scale horizontally. Caching moves that repeat cost to a much faster layer (in-memory, close to the app), trading a small amount of staleness risk for a large reduction in latency and database load.

### How it works — the main strategies

**Cache-aside (lazy loading)** is the default pattern almost everyone uses: the app checks the cache first, and only on a miss does it go to the database — then it writes the result into the cache for next time. It's simple and naturally self-healing (a cache that's wiped just repopulates itself on the next request), but it means the _first_ request after an expiry always pays the full cost — this is called a "cold" cache miss.

**Write-through** writes to the cache and the database at the same time, synchronously — the cache is never stale, but every write now costs more because it's doing two things instead of one.

**Write-back** writes to the cache immediately and flushes to the database later, asynchronously — writes feel fast to the user, but if the server crashes before that flush happens, that data is gone. You're trading durability for write latency, which is only acceptable for data you can afford to lose a little of.

\`\`\`
Request
    │
    ▼
  Redis
 ┌──┴──┐
 │ Hit │──────────► Return Data (fast path — database never touched)
 └──┬──┘
   Miss
    │
    ▼
 Database (slow path — only happens when the cache doesn't have it yet)
    │
    ▼
 Store in Redis (so the NEXT request for the same thing takes the fast path)
    │
    ▼
 Return Response
\`\`\`

### Syntax / API

\`\`\`js
async function getUser(id) {
  const cacheKey = \`user:\${id}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached); // cache hit — skip the database entirely

  const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  await redis.set(cacheKey, JSON.stringify(user), "EX", 3600); // cache miss — fetch, then remember for next time
  return user;
}

// Invalidation — the cache MUST be updated/cleared whenever the underlying data changes,
// or you'll serve stale data indefinitely until the TTL happens to expire
async function updateUser(id, data) {
  const user = await db.query(
    "UPDATE users SET ... WHERE id = $1 RETURNING *",
    [id],
  );
  await redis.del(\`user:\${id}\`); // invalidate — next read will repopulate with fresh data
  return user;
}
\`\`\`

### Real-world / production example

> A product-detail API was fronted by React → Node → Postgres, and database CPU hit 95% during a traffic spike from a marketing campaign — every product page view was hitting Postgres directly for data that changed maybe once a day. Adding a Redis cache-aside layer in front of the product-read query (1 hour TTL, invalidated on product updates) brought the cache hit rate to roughly 90% within minutes of traffic normalizing, and p50 latency on that endpoint dropped from around 300ms to about 12ms — because 9 out of 10 requests now never touched the database at all. Database CPU dropped correspondingly, giving real headroom for the writes that still had to go through.

**Tradeoffs accepted:** a product edit could theoretically be invisible to viewers for up to the TTL window if invalidation was ever missed on some code path — an acceptable tradeoff here because product details aren't safety- or money-critical, and invalidation was wired into every update path deliberately (see the code above) specifically to minimize that window.

### Common mistakes

- Caching data that changes on almost every read (near-zero hit rate, all cost, no benefit) — caching is only worth it when reads meaningfully outnumber writes for that data.
- Forgetting to invalidate the cache on write, leaving stale data served for up to the full TTL — the single most common caching bug.
- No TTL at all on cached data that _can_ go stale, meaning a missed invalidation lasts forever, not just until the next expiry.
- Caching per-user data using a cache key that doesn't include the user ID, accidentally serving one user's data to another (a serious data-leak bug, not just a performance one).

### Best practices

- Always set a TTL as a safety net, even when you also invalidate explicitly on writes — it caps the damage of a missed invalidation path.
- Key caches specifically enough to avoid cross-user or cross-tenant leakage (e.g., \`user:42:profile\`, not just \`profile\`).
- Cache at the layer where the cost/benefit is clearest — usually the read-heavy, write-light data closest to the database, not arbitrarily deep in business logic.

### Performance considerations

- A cache hit ratio is the metric that matters most — a cache with a 20% hit rate is barely helping and may not be worth its added complexity and invalidation risk; a 90%+ hit rate (as in the production story) is a genuine multiplier on both latency and database headroom.
- Redis itself can become a bottleneck or single point of failure at large scale — Redis Cluster / replication addresses that, but it's worth knowing the cache layer isn't infinitely scalable "for free."

### Security considerations

- Never cache sensitive data (raw passwords, full payment details) even encrypted-at-rest in the primary DB, unless the cache layer itself has equivalent protections — a cache is often less hardened than the primary database by default.
- Ensure cache keys can't be manipulated by user input in a way that causes one user to read another's cached data (cache key injection).

### Interview questions — beginner to senior

- **Beginner:** What is caching, and why does it help performance?
- **Intermediate:** What's the difference between cache-aside, write-through, and write-back?
- **Advanced:** How do you avoid serving stale data after a write, and what happens if invalidation itself fails?
- **Senior:** Walk through diagnosing a database CPU spike and designing a caching layer to fix it — what would you cache, what TTL, and what's your invalidation strategy, including the production story format above.

### Related topics

Redis, Databases (§05), Performance (§14), CDNs (§29), Scaling Strategy (Bonus section).

---

## 14 Performance

Most backend performance work boils down to removing unnecessary work, not making the necessary work faster — which is why the highest-leverage fixes are usually indexes and caching (§05, §13), not clever code-level micro-optimizations.

**Pagination and lazy loading** both attack the same root cause: fetching more data than you actually need right now. An unbounded query that returns every row is fine with 100 rows and a real problem with 10 million.

**Load balancing** matters once you have multiple server instances — the strategy you pick changes behavior under load. Round robin is simple but blind to actual server load; least-connections routes to whichever instance currently has the fewest active requests, which handles uneven request costs better; IP hash sends the same client to the same server consistently, useful if you still have any per-server state.

---

## 15 API Design

### What is it?

API design is the set of decisions about how your API's surface — its URLs, request/response shapes, error formats, versioning strategy — behaves, made deliberately rather than accumulating ad hoc as endpoints get added.

### Why do we need it?

An API is a contract other code depends on, often code you don't control and can't quickly redeploy (a mobile app in the app store, a third-party integration). Good design minimizes surprise — a consumer of your API should be able to predict how an endpoint they've never used behaves, based on patterns they've seen elsewhere in the same API — which directly reduces integration bugs and support burden. Bad design (inconsistent error shapes, undocumented breaking changes) doesn't just look untidy, it actively breaks other people's production systems.

### How it works — REST vs GraphQL vs RPC/gRPC

**REST** is the default because it's cacheable (GET requests map naturally onto HTTP caching, §01/§13) and universally understood — any developer, in any language, already roughly knows how to use it. **GraphQL** earns its complexity when clients have genuinely different data needs (a mobile app wants a thin payload, a dashboard wants a nested, heavy one) — it solves the "over-fetching / under-fetching" problem REST has when one fixed endpoint shape has to serve every consumer, letting each client request exactly the fields it needs in one round trip. **gRPC/RPC** trades human-readability for raw performance and strict typed contracts (via Protobuf) — a good fit for internal service-to-service calls where both sides are code you control, not a public-facing API third parties will read by hand.

\`\`\`
Client needs vary a lot per consumer? ──Yes──► GraphQL
        │
        No
        │
Internal service-to-service, need max performance/strict typing? ──Yes──► gRPC
        │
        No
        │
Public-facing, cacheable, broadly understood? ──► REST (default)
\`\`\`

### Syntax / API — versioning and consistent error shapes

\`\`\`
/api/v1/users        (URI versioning — simplest, visible in logs, most common)
Accept: application/vnd.myapi.v2+json   (header versioning — cleaner URLs, less discoverable)
\`\`\`

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email is required",
    "fields": ["email"]
  }
}
\`\`\`

### Real-world example

\`\`\`
GET /orders?cursor=eyJpZCI6MTAwfQ&limit=20&sort=-createdAt&status=completed
\`\`\`

A well-designed list endpoint supports cursor pagination (§02), explicit sorting, and filtering — all following the same query-param conventions the rest of the API already uses, so a consumer integrating a new endpoint doesn't have to re-learn a different pattern.

### Production story

> A public API shipped a "breaking" change — a field renamed from \`total\` to \`totalAmount\` — inside what was communicated internally as a "minor update," without bumping the API version. Every third-party integration that read \`response.total\` silently started receiving \`undefined\` instead of erroring loudly, which meant several partners didn't notice for days, quietly showing $0 totals to their own users before anyone reported it. The actual fix was trivial (add both fields temporarily, deprecate the old one with a sunset date, communicate it explicitly), but the incident became the reason the team adopted a hard rule afterward: any field removal or rename is a breaking change requiring a new API version, full stop, with the old version kept alive for a defined deprecation window — no more relying on "it's a pretty small change" as a judgment call made under deadline pressure.

### Common mistakes

- Renaming or removing fields without bumping the API version — silently breaking existing integrations rather than erroring loudly.
- Inconsistent error response shapes across different endpoints, forcing every API consumer to special-case each one.
- Using verbs in URLs (\`/getUserOrders\`) instead of resource nouns (\`/users/:id/orders\`) — breaks the predictability REST design relies on.
- Returning different pagination styles (offset here, cursor there) across different list endpoints in the same API.

### Best practices

- Version explicitly and treat any field removal/rename/type-change as a breaking change requiring a new version.
- Standardize error shape, pagination style, and naming conventions once, early, and apply them everywhere — retrofitting consistency later is far more painful.
- Maintain OpenAPI/Swagger as the single source of truth, generating docs and client SDKs from it rather than hand-maintaining separate documentation that drifts out of sync.
- Communicate deprecations with a concrete sunset date, not an open-ended "we'll remove this eventually."

### Performance considerations

- GraphQL's flexibility comes with a real cost: a naive resolver implementation can trigger the "N+1 query problem" (one query per nested field per item) unless batched (e.g., via DataLoader) — a common GraphQL-specific performance trap that REST doesn't have.
- gRPC's binary Protobuf format is meaningfully smaller and faster to (de)serialize than JSON, which matters at high internal service-to-service call volumes.

### Security considerations

- Never leak internal error details (stack traces, database error messages) into public API error responses — return a generic message and log the detail server-side (§18).
- Rate-limit and authenticate every public endpoint independently — an API's "shape" is also part of its attack surface.

### Interview questions — beginner to senior

- **Beginner:** What makes an API "RESTful"? What's a resource vs an action?
- **Intermediate:** When would you choose GraphQL over REST, and what's the actual tradeoff?
- **Advanced:** How do you version a public API without breaking existing integrations?
- **Senior:** Design the versioning and deprecation policy for a public API used by dozens of third-party integrators — how do you communicate and enforce breaking changes safely?

### Related topics

REST APIs (§02), Validation (§16), Error Handling (§18), OpenAPI/Swagger.

---

## 16 Validation

Validation exists to reject bad input _before_ it reaches your business logic — catching a missing field at the edge is far cheaper (and safer) than discovering it three layers deep as a cryptic database error.

\`\`\`js
const { z } = require("zod");

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().positive().optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({ errors: result.error.flatten() });
    }
    req.body = result.data; // downstream code can now trust req.body matches the schema exactly
    next();
  };
}

app.post("/signup", validate(signupSchema), signupController);
\`\`\`

Validation and **sanitization** solve related but different problems: validation _rejects_ input that doesn't meet the rules (422 error, nothing proceeds), while sanitization _cleans_ input so it's safe to use even if it wasn't perfectly formed (e.g., stripping \`<script>\` tags from a comment rather than rejecting the whole comment). You often want both — reject what's clearly wrong, sanitize what's merely messy.

---

## 17 Logging

Logs are what you actually have to debug a production incident _after the fact_ — you can't attach a debugger to a server that already crashed at 3am, but you can read what it logged right before it did.

\`\`\`js
const pino = require("pino");
const logger = pino();

// A correlation ID lets you trace one single request as it flows through multiple
// services/log lines — without this, a distributed system's logs are just a pile of
// unrelated lines with no way to reconstruct what happened to one specific request
const { AsyncLocalStorage } = require("async_hooks");
const als = new AsyncLocalStorage();

app.use((req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  als.run({ correlationId }, () => {
    res.setHeader("x-correlation-id", correlationId);
    next();
  });
});

function log(message, extra = {}) {
  const store = als.getStore();
  logger.info({ correlationId: store?.correlationId, ...extra }, message);
}
\`\`\`

**Log levels** exist so you can control verbosity per environment without changing code — you'd drown in noise running \`debug\`-level logs in production at scale, but you desperately want them while developing locally. **Structured logging** (logging JSON objects instead of free-text sentences) matters once you have enough logs that a human can't just scroll through them — structured fields are what make logs actually _queryable_ in a tool like Grafana Loki or the ELK stack ("show me every error where \`userId = 42\`"), which plain text can't do reliably.

---

## 18 Error Handling

### What is it?

Error handling is how your application detects, reports, and recovers from things going wrong — from bad user input to a downstream service being completely unreachable.

### Why do we need it?

Every non-trivial system fails sometimes — a database connection drops, a third-party API times out, a user submits malformed input. Without deliberate error handling, a single failure anywhere can crash the entire process, leak internal implementation details to a client, or silently corrupt data. Handling errors well is what turns "the payment service is down" from a full outage into a graceful, recoverable degradation.

### How it works — the core distinction

The most useful distinction here is **operational errors** (expected, recoverable failures — bad input, a downstream timeout) vs **programmer errors** (actual bugs — calling a method on \`undefined\`). You want to handle the first gracefully and return a clean response; the second is a signal something in your code is actually broken and probably shouldn't be silently swallowed — you want it logged loudly so it gets fixed, not masked by a generic catch-all.

\`\`\`
Error occurs
    │
    ▼
Is it operational (expected)?
    │
 ┌──┴──┐
 Yes    No
 │       │
 ▼       ▼
Return   Log full stack (this is a real bug)
clean    │
response ▼
         Return generic 500 to client
         (never leak internals)
\`\`\`

### Syntax / API

\`\`\`js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as an expected error, safe to show the client
  }
}

app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  logger.error(err); // an unexpected bug — log the full stack for debugging, but never leak internals to the client
  res.status(500).json({ error: "Something went wrong" });
});

// Retry with exponential backoff — useful for transient failures (a downstream API
// blipping for a second), harmful for permanent ones (retrying a 404 forever gains nothing) —
// so retries should generally be limited to errors you expect to be temporary
async function retry(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2); // backing off doubles the wait each time, giving the failing dependency room to recover
  }
}
\`\`\`

**Circuit breaker** takes this a step further: if a downstream dependency is _consistently_ failing, retrying every single request against it just adds load to something already struggling, and makes your own service slow while it waits on doomed calls. A circuit breaker notices the failure pattern and "opens" — short-circuiting calls to that dependency immediately (failing fast) for a cooldown window, instead of hammering it, then cautiously tests if it's recovered before fully reconnecting.

\`\`\`
Closed (normal)  ──failure rate exceeds threshold──►  Open (fail fast, no calls sent)
     ▲                                                        │
     │                                                  cooldown timer elapses
     │                                                        ▼
     └───────success──────  Half-Open (send a few test calls through)
\`\`\`

### Real-world example

\`\`\`js
const breaker = new CircuitBreaker(callPaymentProvider, {
  errorThresholdPercentage: 50, // open the circuit if 50%+ of recent calls fail
  timeout: 3000,
  resetTimeout: 30000, // wait 30s before trying a test call again
});

app.post("/checkout", async (req, res) => {
  try {
    const result = await breaker.fire(req.body);
    res.json(result);
  } catch (err) {
    // Circuit open, or the call itself failed — either way, fail gracefully,
    // e.g. queue the payment for retry rather than losing the order entirely
    res
      .status(503)
      .json({ error: "Payment temporarily unavailable, please retry shortly" });
  }
});
\`\`\`

### Production story

> A checkout service called an external payment provider directly, with no circuit breaker and unlimited retries on timeout. When the payment provider had a partial outage — responding, but taking 20+ seconds per call instead of failing fast — the checkout service's own request handlers piled up waiting on those slow calls, exhausting its connection pool and making the _entire_ checkout service unresponsive, even for requests that had nothing to do with payment. A dependency that was "only" degraded, not fully down, cascaded into a full outage of an unrelated service. The fix was adding a circuit breaker with an aggressive timeout: once failure/timeout rate crossed a threshold, the breaker opened and started failing fast immediately rather than waiting the full 20+ seconds per call, freeing up the connection pool for everything else. The deeper lesson: retries and generous timeouts, without a circuit breaker, don't make a system more resilient to a struggling dependency — they can make things _worse_, by holding resources open waiting on calls that were never going to succeed in time.

### Common mistakes

- Catching an error and silently swallowing it (\`catch (e) {}\`) — the error disappears with no log, no report, nothing to debug later.
- Retrying non-idempotent operations without an idempotency key (§02) — a retry after a timeout can duplicate a side effect (like a payment) rather than just retrying safely.
- Leaking stack traces or database error messages directly into API responses — a real information-disclosure risk, not just an untidy one.
- Retrying indefinitely with no backoff or circuit breaker on a dependency that's genuinely down, worsening the outage rather than helping recover from it (see the production story above).

### Best practices

- Distinguish operational from programmer errors explicitly in code (as \`AppError\` does above), and handle each differently.
- Use exponential backoff for retries, and cap the number of attempts — unlimited retries on a permanently failing operation just adds load for no benefit.
- Add circuit breakers around any call to an external dependency that could degrade rather than cleanly fail.
- Centralize error handling in one place (global error middleware) rather than duplicating try/catch response logic across every controller.

### Performance considerations

- A circuit breaker's main performance benefit isn't just user-facing — it protects the calling service's own resources (connection pool, thread/event-loop time) from being consumed by calls that were never going to succeed.

### Security considerations

- Never return raw stack traces, SQL error text, or internal file paths in API error responses — attackers use these for reconnaissance. Log the detail server-side; return a generic message to the client.

### Interview questions — beginner to senior

- **Beginner:** What's the difference between an operational error and a programmer error?
- **Intermediate:** Why is exponential backoff better than immediately retrying on failure?
- **Advanced:** Explain how a circuit breaker works, and why "just add more retries" can make an outage worse.
- **Senior:** Walk through a real cascading failure caused by a slow (not fully down) downstream dependency, and how you'd have designed the system to prevent that blast radius in the first place.

### Related topics

Circuit Breaker (System Design Patterns chapter), Idempotency Keys (§02), Logging (§17), Microservices resilience patterns (§23).

---

## 19 File Uploads

\`\`\`js
const multer = require("multer");
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // caps upload size — without this, a huge file can exhaust server memory/disk
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

app.post("/upload", upload.single("avatar"), async (req, res) => {
  // Upload straight to S3 rather than saving to local disk — local disk doesn't survive
  // a server restart or scale across multiple instances, object storage does
  const result = await s3
    .upload({
      Bucket: "my-bucket",
      Key: req.file.originalname,
      Body: req.file.buffer,
    })
    .promise();
  res.json({ url: result.Location });
});
\`\`\`

Never trust the client-reported MIME type or filename — an attacker can label a malicious file as \`image/png\` trivially, so real validation checks the actual file content, not just the header the client claims. **Chunked upload** matters for large files on unreliable connections: splitting the file into pieces client-side means a dropped connection only costs you the current chunk's progress, not the entire upload starting over from zero.

---

## 20 Background Jobs

### What is it?

A background job is a unit of work executed outside the request/response cycle — the API acknowledges the request immediately, and a separate worker process actually performs the (often slower) work afterward.

### Why do we need it?

Some work doesn't need to happen _before_ you respond to the user — sending a welcome email shouldn't make someone wait an extra 2 seconds for their signup request to return. Worse, if that email-sending call fails or times out, it can fail the _entire_ signup request over something the user doesn't actually need to wait on. Background jobs let you acknowledge the request immediately and do the slower, less time-critical work asynchronously, decoupling "did the core operation succeed" from "did every downstream side effect complete."

### How it works

\`\`\`js
const { Queue, Worker } = require("bullmq");

const emailQueue = new Queue("emails", { connection: redisConnection });

// Producer — instead of calling sendEmail() directly (which would block the request
// and risk being lost if the process crashes mid-send), we hand it off to a durable queue
await emailQueue.add(
  "welcome-email",
  { userId: user.id },
  {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
);

// Consumer — runs independently of the web server, picks up jobs whenever it's free
new Worker(
  "emails",
  async (job) => {
    await sendWelcomeEmail(job.data.userId);
  },
  { connection: redisConnection },
);
\`\`\`

A **dead letter queue** is where a job lands once it's exhausted every retry attempt — the alternative (silently dropping a job that keeps failing) means you'd never even know a welcome email never got sent. A DLQ turns silent failure into something you can actually see and investigate.

### Real-world example — cron jobs for scheduled, recurring work

\`\`\`js
const cron = require("node-cron");

// Runs every day at 2am — cleaning up expired sessions is a good fit for background
// scheduling: it's not time-critical to the second, and doing it during low-traffic hours
// avoids competing with real user requests for database resources
cron.schedule("0 2 * * *", async () => {
  await db.query("DELETE FROM sessions WHERE expires_at < NOW()");
});
\`\`\`

### Production story

> A signup endpoint called \`sendWelcomeEmail()\` synchronously, inline, before returning a response. During a period when the email provider was experiencing elevated latency (not fully down, just slow — around 8-10 seconds per call instead of under 1 second), every signup request on the platform started taking 8-10 seconds too, and a meaningful fraction of signups began timing out client-side and appearing to fail entirely, even though the actual account had already been created successfully in the database. Users were left confused, some retrying and creating duplicate signup attempts. The fix was moving email sending into a background job queue: the signup endpoint now creates the account, enqueues the welcome email job, and returns immediately — email delivery speed (or a temporary provider outage) no longer has any bearing on how fast or reliably the core signup flow completes.

### Common mistakes

- Doing genuinely slow, non-critical work (sending emails, generating reports, calling third-party APIs) synchronously inline with the main request, coupling the request's success to that slower operation's success (see production story).
- Not setting a bounded retry count, letting a permanently failing job retry forever and clutter logs/consume worker capacity.
- No dead-letter queue, so a job that exhausts retries just vanishes with no record it ever failed.
- Running scheduled jobs (cron) without a locking mechanism across multiple instances, causing the same job to run multiple times simultaneously if you've scaled to more than one server.

### Best practices

- Move anything not required for the immediate response — especially calls to external/third-party services — into a background job.
- Always configure bounded retries with backoff, plus a dead-letter queue for jobs that exhaust them.
- Make job handlers idempotent (§02/§21), since queue redelivery can run the same job twice.
- Use distributed locking (or a scheduler designed for it) when running cron jobs across multiple instances, so the same scheduled task doesn't fire redundantly on every instance.

### Performance considerations

- Background jobs let the request/response path stay fast and predictable, decoupled entirely from a slow downstream dependency's actual latency.
- Worker concurrency (how many jobs process in parallel) needs to be tuned against downstream capacity — a worker pool that's too aggressive can overwhelm the very dependency (an email provider, a third-party API) it's calling.

### Security considerations

- Job payloads containing sensitive data (PII, payment details) should be handled with the same care as any other data at rest — a queue is a data store too.
- Validate job data on the consumer side just as you would an API request — a job payload can be malformed or malicious just like user input can.

### Interview questions — beginner to senior

- **Beginner:** Why would you send an email in the background instead of synchronously during signup?
- **Intermediate:** What's a dead-letter queue, and why is it needed even with retries configured?
- **Advanced:** How do you handle a scheduled cron job running correctly-once across multiple server instances?
- **Senior:** Walk through redesigning a signup flow where a slow third-party dependency was causing widespread request timeouts, and how background jobs specifically solved it.

### Related topics

Message Queues (§21), Idempotency Keys (§02), Error Handling (§18), Distributed Locking (System Design Patterns).

---

## 21 Message Queues

### What is it?

A message queue is a durable intermediary that sits between a producer (something that generates work) and a consumer (something that processes it) — the producer drops a message in, and a consumer picks it up whenever it's ready.

### Why do we need it?

A message queue decouples the thing producing work from the thing doing the work — the producer doesn't need to know or care whether a consumer is even online right now, it just drops a message and moves on. Without a queue, a direct call from producer to consumer means both have to be up simultaneously, and a slow or failing consumer directly slows down or fails the producer's own request — exactly the cascading-failure problem covered in §18. A queue absorbs that coupling: the producer's request finishes immediately, and the actual work happens asynchronously, at whatever pace the consumer can sustain, with the queue holding messages durably in between.

### How it works — comparing the major systems

**RabbitMQ vs Kafka vs SQS** solve overlapping but distinct needs. RabbitMQ shines when you need flexible routing logic (exchanges deciding which queue a message goes to based on rules) and classic task-queue semantics — a message is consumed once and gone. Kafka is built around an append-only, replayable log — messages aren't deleted on consumption, so multiple independent consumer groups can all read the same stream at their own pace, which is exactly what you want for event streaming or when you might need to reprocess history later. SQS is the "don't want to run any of this yourself" option — fully managed, simple, and tightly integrated if you're already on AWS.

\`\`\`
Producer ──► Queue/Topic ──► Consumer Group A (e.g. billing service)
                        └──► Consumer Group B (e.g. analytics service)

    Kafka: BOTH groups can independently read the entire stream at their own pace,
    since messages aren't deleted on read — this is what "replayable log" means.

    RabbitMQ (classic queue): once ONE consumer acks a message, it's gone —
    fan-out to multiple independent consumers needs an explicit fan-out exchange.
\`\`\`

### Syntax / API — idempotent consumers for at-least-once delivery

\`\`\`js
// Queues typically guarantee "at-least-once" delivery — meaning the SAME message can
// legitimately be delivered twice (e.g., the consumer crashed right after processing but
// before acknowledging). "Exactly-once" delivery is extremely hard to guarantee in a
// distributed system, so in practice you approximate it: accept that duplicates can
// arrive, and make your processing logic idempotent so a duplicate is harmless —
// literally the same idea as the idempotency keys in §02, applied to queue consumers.
async function processPayment(message) {
  const alreadyProcessed = await redis.get(\`processed:\${message.id}\`);
  if (alreadyProcessed) return; // duplicate delivery — safely skip re-processing

  await chargeCustomer(message.payload);
  await redis.set(\`processed:\${message.id}\`, "1", "EX", 86400);
}
\`\`\`

**Ordering** is another common gotcha: Kafka only guarantees order _within a single partition_, not across an entire topic — if strict ordering matters for a given entity (e.g., all events for one user), you need to make sure they're always routed to the same partition (usually by keying on that entity's ID).

### Real-world example

\`\`\`js
// Producer — keying by userId ensures every event for the same user lands on the
// same Kafka partition, preserving order for that user specifically
await producer.send({
  topic: "user-events",
  messages: [{ key: String(userId), value: JSON.stringify(event) }],
});
\`\`\`

### Production story

> An order-processing pipeline consumed messages from a queue and, on any processing error, simply logged the error and moved on without acknowledging or explicitly handling the failure — the message stayed unacknowledged, so the queue redelivered it, which retried the same failure indefinitely, over and over, effectively taking that message's processing lane offline while contributing nothing but repeated log noise. Because there was no dead-letter queue configured, a single malformed order message (a corrupted payload from an upstream bug) got stuck redelivering forever, drowning out legitimate messages in the logs and consuming consumer capacity that should've gone to healthy messages. The fix was configuring a max-retry count with a dead-letter queue: after N failed attempts, the message moves to a separate DLQ for manual inspection instead of blocking the main queue indefinitely. The lesson: "just retry on failure" without a limit and a DLQ can turn one bad message into an ongoing operational drag, not a one-time blip.

### Common mistakes

- Assuming "exactly-once" delivery when the underlying system only guarantees "at-least-once" — leads to real duplicate-processing bugs (double charges, duplicate emails) unless consumers are made idempotent.
- No dead-letter queue configured, so a permanently failing message retries forever instead of being set aside for investigation (see production story).
- Assuming global ordering across an entire Kafka topic, when it's only guaranteed within a single partition.
- Using a message queue for something that actually needs a synchronous response (the caller needs the result _right now_ to proceed) — queues are for genuinely asynchronous work.

### Best practices

- Design every consumer to be idempotent by default — assume redelivery will happen eventually, not just in an edge case.
- Always configure a dead-letter queue with a bounded retry count, so failures become visible rather than silently looping.
- Key messages deliberately (e.g., by entity ID) when relative ordering for that entity matters.
- Monitor queue depth/lag as a first-class metric — a growing backlog is an early warning sign of a struggling consumer, long before it becomes a full outage.

### Performance considerations

- Kafka's append-only log design gives it very high write throughput compared to traditional queues, at the cost of more operational complexity (partitions, consumer group offsets) to manage correctly.
- Batch consuming/acking messages where possible rather than one at a time — reduces the overhead of round trips to the broker.

### Security considerations

- Encrypt messages in transit (TLS) and, for sensitive payloads, consider encrypting the message body itself — a queue is another data store, and inherits the same "don't put secrets in plaintext" rules as anything else.
- Apply access control per topic/queue — not every service needs to produce or consume from every queue in the system.

### Interview questions — beginner to senior

- **Beginner:** What problem does a message queue solve that a direct API call doesn't?
- **Intermediate:** What's the difference between at-least-once, at-most-once, and exactly-once delivery?
- **Advanced:** Why does Kafka only guarantee ordering within a partition, and how do you design around that when strict ordering matters?
- **Senior:** Design a consumer that handles duplicate delivery, permanent failures (via DLQ), and back-pressure from a slow downstream dependency, end to end.

### Related topics

Idempotency Keys (§02), Background Jobs (§20), Outbox Pattern (System Design Patterns), Microservices (§23).

---

## 22 WebSockets

### What is it?

A WebSocket is a persistent, full-duplex (both directions simultaneously) connection between a client and server, established over a single long-lived TCP connection, allowing either side to send data at any time without waiting for a request.

### Why do we need it?

HTTP is fundamentally request-then-response — the server can't just decide to push you something without you asking first. WebSockets exist for the cases where that's the wrong model: chat, live notifications, collaborative editing — anything where the server needs to push data to the client the moment something happens, not whenever the client next happens to ask. Polling (repeatedly asking "anything new?") can approximate this, but wastes requests when nothing's changed and adds latency up to the polling interval; WebSockets remove both problems by keeping one connection open and pushing the instant there's something to send.

### How it works

\`\`\`js
const { Server } = require("socket.io");
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.join(\`room:\${socket.handshake.query.roomId}\`); // groups connections so you can broadcast to a subset, not everyone

  socket.on("message", (data) => {
    io.to(\`room:\${data.roomId}\`).emit("message", data);
  });

  socket.on("disconnect", () => {
    /* cleanup */
  });
});
\`\`\`

**Why scaling WebSockets is genuinely trickier than scaling REST**: a WebSocket connection is a long-lived, stateful connection to _one specific server instance_. If you have 3 server instances behind a load balancer and user A is connected to server 1 while user B is connected to server 2, and A sends B a chat message, server 1 has no direct way to push that message to a socket that's only open on server 2 — they're separate processes with separate memory. The fix is a **Redis adapter**: every server instance subscribes to Redis pub/sub, so when server 1 needs to broadcast something, it publishes to Redis, and every instance (including server 2) receives it and pushes it out to whichever of _its own_ connected sockets need it.

\`\`\`
Server 1 (user A connected)          Server 2 (user B connected)
       │                                     │
       └──────────► Redis Pub/Sub ◄──────────┘
                (every server subscribes — a message published by ANY
                 server reaches every OTHER server's connected sockets too)
\`\`\`

### Real-world example — heartbeat for detecting dead connections

\`\`\`js
// A TCP connection can die silently (a phone loses signal mid-connection) without
// either side receiving a clean disconnect event — a heartbeat catches this
io.on("connection", (socket) => {
  socket.isAlive = true;
  socket.on("pong", () => {
    socket.isAlive = true;
  });
});

setInterval(() => {
  io.sockets.sockets.forEach((socket) => {
    if (!socket.isAlive) return socket.disconnect(true); // never responded to the last ping — assume dead
    socket.isAlive = false;
    socket.emit("ping");
  });
}, 30000);
\`\`\`

### Production story

> A real-time notification feature worked perfectly in staging (a single server instance) but broke mysteriously in production once traffic grew enough to run 3 instances behind a load balancer — some users simply never received notifications, seemingly at random. The cause: the app was broadcasting notifications via \`io.emit()\` with no Redis adapter configured, so each server instance could only reach the sockets connected _to it specifically_. A user connected to server 2 never got a notification triggered by an event processed on server 1, because server 1 had no way to reach server 2's sockets. Adding the Redis adapter (a few lines of configuration, no application logic changes) fixed it immediately — the bug wasn't in the notification logic at all, it was a fundamental gap in how WebSockets behave once you're no longer running a single instance.

### Common mistakes

- Broadcasting via \`io.emit()\`/\`io.to(room).emit()\` without a Redis (or equivalent) adapter once running more than one server instance — messages silently fail to reach sockets connected to other instances (see production story).
- No heartbeat/ping-pong mechanism, so dead connections (phone lost signal, laptop closed) accumulate as "zombie" sockets the server thinks are still alive.
- Putting large amounts of state directly on the socket object without a plan for what happens when that server instance restarts — all of it is gone, along with the connection.
- Not authenticating the WebSocket handshake itself — treating the initial HTTP upgrade request as implicitly trusted just because a normal HTTP request elsewhere was authenticated.

### Best practices

- Always configure a Redis (or equivalent pub/sub) adapter before running more than one server instance — this is not optional past a single instance.
- Implement a heartbeat and actively disconnect sockets that stop responding, rather than letting dead connections accumulate.
- Authenticate the WebSocket connection at handshake time (e.g., validate a token passed in the connection query/headers), just as you would any other request.
- Group connections into rooms/namespaces deliberately, so broadcasts reach exactly the intended subset, not everyone connected.

### Performance considerations

- A WebSocket connection held open per user costs server memory even when idle — at very large concurrent connection counts, this becomes a real capacity planning consideration distinct from stateless HTTP request handling.
- Redis pub/sub fan-out adds a small amount of latency per broadcast compared to a single-instance in-memory emit — usually negligible, but worth knowing it's not literally free.

### Security considerations

- Validate and authenticate the WebSocket handshake — an unauthenticated WebSocket endpoint is just as much an attack surface as an unauthenticated REST endpoint.
- Rate-limit messages coming _from_ the client over the socket too — a WebSocket doesn't automatically inherit REST's per-request rate limiting, and a malicious client can flood messages over an open connection.

### Interview questions — beginner to senior

- **Beginner:** What's the difference between a WebSocket and a regular HTTP request?
- **Intermediate:** Why can't a single server instance broadcast a WebSocket message to a socket connected to a different instance?
- **Advanced:** How does a Redis adapter solve the multi-instance broadcast problem?
- **Senior:** Design a real-time chat system's WebSocket layer for horizontal scaling — cover connection distribution, broadcast fan-out, presence tracking, and reconnection handling.

### Related topics

Caching/Redis (§13), Backend System Design chat system model (§24), Load Balancing (§14).

---

## 23 Microservices

### What is it?

A microservices architecture splits an application into multiple independently deployable services, each owning its own data, communicating over the network rather than through in-process function calls.

### Why do we need it?

Microservices exist to solve organizational and scaling problems that a monolith runs into as it grows — not because splitting things up is inherently better. In a monolith, every team shares one codebase, one deployment pipeline, and one failure domain: a bug in one part can take down the whole app, and you can't scale just the "search" feature independently of everything else. Microservices let teams own, deploy, and scale their piece independently — the real cost is that function calls become network calls, which can fail, time out, or arrive out of order in ways an in-process call simply never does, and you lose the safety net of one shared database transaction spanning everything.

### How it works — the core supporting patterns

\`\`\`
Client → API Gateway → Service Discovery → [Service A, Service B, Service C]
                                                 │ REST/gRPC/Message Queue
\`\`\`

The **API Gateway** exists so clients don't need to know about your internal service topology — they hit one entry point, and it handles cross-cutting concerns (auth, rate limiting, routing) centrally instead of every service reimplementing them. **Service discovery** solves a very practical problem: in a system where services scale up/down and get redeployed constantly, hardcoding "Service B lives at \`10.0.0.5\`" breaks the moment it moves — discovery lets services find each other's current location dynamically.

The **Saga pattern** exists because you can't wrap a transaction across multiple independent databases the way you could with a single-database ACID transaction — there's no single commit that spans services. Instead, a saga breaks a multi-service operation into a sequence of local transactions, each with a defined "undo" (compensating action) if a later step fails — e.g., if charging the customer succeeds but reserving inventory fails, the saga runs a compensating "refund the customer" step rather than leaving things half-done.

\`\`\`
Order Saga:
  1. Charge customer         → success
  2. Reserve inventory       → FAILS
  3. Compensate: refund customer   ← undo step 1, since step 2 failed
\`\`\`

The **Outbox pattern** solves a subtler problem: if a service needs to both update its database _and_ publish an event about that update, doing these as two separate operations creates a window where one can succeed and the other fail (DB commit succeeds, but the process crashes before publishing the event — now other services never find out). The fix is writing the event into an "outbox" table in the _same_ local transaction as the actual data change, then having a separate process reliably publish outbox rows afterward — guaranteeing the event is never lost even if publishing itself has to be retried.

### Syntax / API — a saga step with a compensating action

\`\`\`js
async function createOrderSaga(orderData) {
  const steps = [];
  try {
    const payment = await chargeCustomer(orderData);
    steps.push(() => refundCustomer(payment.id)); // compensating action, in case a LATER step fails

    const reservation = await reserveInventory(orderData);
    steps.push(() => releaseInventory(reservation.id));

    await confirmOrder(orderData);
  } catch (err) {
    for (const compensate of steps.reverse()) await compensate(); // undo everything that DID succeed, in reverse order
    throw err;
  }
}
\`\`\`

### Real-world example

An e-commerce checkout spans an Orders service, a Payments service, and an Inventory service — each with its own database. There's no single database transaction that can atomically span all three, so the saga pattern above is what keeps the overall operation consistent even though it's built from three separate local transactions.

### Production story

> A team split a monolith into microservices primarily to let different teams deploy independently — a legitimate goal — but didn't invest early in service discovery or a circuit breaker pattern. When the Inventory service was redeployed and briefly unavailable during a rolling update, the Orders service (which called it via a hardcoded internal URL, with unlimited retries and no timeout) began queueing up requests waiting on a dependency that was, for those few minutes, genuinely down — and because Orders had no circuit breaker, its own thread/connection pool filled up waiting on those calls, making Orders itself unresponsive to completely unrelated requests, cascading a 90-second Inventory redeploy into a much longer full-checkout outage. The lesson mirrors §18's circuit breaker story exactly, but at the architecture level: splitting into microservices without also building in the resilience patterns (circuit breakers, timeouts, service discovery with health checks) doesn't just add complexity — it actively introduces new failure modes a monolith never had in the first place, since a monolith's internal function calls can't "time out" the way network calls between services can.

### Common mistakes

- Splitting into microservices before there's an actual organizational or scaling reason to — the network-call complexity is a real cost paid immediately, while the benefits (independent scaling/deployment) often aren't needed yet.
- No circuit breakers or timeouts on inter-service calls, letting one degraded (not even fully down) service cascade into an outage of services that depend on it (see production story).
- Sharing a database across multiple "microservices" — this isn't really microservices at all, it's a distributed monolith with all the network-call downsides and none of the data-ownership benefits.
- Forgetting the Saga/Outbox patterns and assuming a multi-service operation is atomic the way a single-database transaction would be.

### Best practices

- Each service should own its data exclusively — other services access it only through that service's API, never by querying its database directly.
- Add circuit breakers, sane timeouts, and retries-with-backoff on every inter-service call, by default, not as an afterthought.
- Use the Saga pattern for any operation spanning multiple services' data, with explicit compensating actions for each step.
- Use the Outbox pattern whenever a service needs to reliably publish an event alongside a database write.

### Performance considerations

- Network calls between services add real latency (and failure surface) compared to in-process function calls in a monolith — a request touching 5 microservices sequentially pays 5x the network round-trip cost of an equivalent monolith call.
- gRPC (§15) is often preferred over REST for internal service-to-service calls specifically because of its lower serialization overhead at this kind of volume.

### Security considerations

- Internal service-to-service traffic still needs authentication (mutual TLS, service-to-service tokens) — "it's internal" is not itself a security boundary once a network is compromised.
- An API Gateway centralizing auth means a misconfiguration there is a single point of failure for the whole system's access control — treat its configuration with commensurate care.

### Interview questions — beginner to senior

- **Beginner:** What's the difference between a monolith and microservices?
- **Intermediate:** Why can't you use a normal database transaction across two microservices?
- **Advanced:** Explain the Saga pattern with a concrete example, including compensating actions.
- **Senior:** Design the resilience strategy (timeouts, circuit breakers, retries, service discovery) for a checkout flow spanning Orders, Payments, and Inventory services — and explain how a partial degradation in one avoids cascading into the others.

### Related topics

Circuit Breaker (§18), Backend System Design (§24), Message Queues (§21), System Design Patterns chapter (Distributed Locking, Leader Election).

---

## 24 Backend System Design

### What is it?

Backend system design is the practice of translating a high-level requirement ("build a chat system," "build a payment system") into concrete architectural decisions — which components you need, how they talk to each other, and what tradeoffs each choice implies.

### Why do we need it?

Almost every non-trivial product requirement can be built multiple different ways, and the "right" way depends entirely on constraints that aren't stated explicitly in the one-line requirement — expected scale, consistency needs, latency budget, failure tolerance. System design as a skill is really the ability to surface those hidden constraints through questions, then justify each architectural choice against them, rather than reaching for a memorized diagram regardless of fit.

### How it works — a repeatable approach

\`\`\`
1. Clarify requirements & constraints
   (scale? read-heavy or write-heavy? consistency needs? latency budget?)
        │
        ▼
2. Identify the core entities and how they relate
        │
        ▼
3. Sketch the high-level components
   (API layer, database choice, cache, queue, etc.)
        │
        ▼
4. Drill into the hardest part specifically
   (the part most likely to bottleneck — usually the write path or a hot read)
        │
        ▼
5. Discuss tradeoffs explicitly
   (what did you give up by choosing this, and why was it the right call here)
\`\`\`

### Idempotency keys belong in almost every payment/order design answer

Any design involving payments, order creation, or queue-based processing should explicitly mention: client generates a UUID key per logical operation → server checks Redis for that key before executing → retries (client-side timeout retry, or queue redelivery) replay the cached result instead of re-running the operation. This is specifically what prevents a network retry from turning into a double charge — see the full implementation in §02.

### Real-world example — quick mental models for common prompts

- **Notification system**: producers push into a message queue → fan-out to workers per channel (email/SMS/push) → track delivery status → failed sends go through retry logic and eventually a dead-letter queue rather than vanishing silently.
- **Rate limiter**: almost always backed by Redis, using either a token bucket (allows bursts up to a cap, refills over time) or a sliding window counter (\`INCR\` + \`EXPIRE\`) — enforced at the API Gateway so it protects every service behind it, not just one.
- **Chat system**: WebSockets for real-time push (§22), an append-heavy data store for message history (Cassandra/Mongo handle high write volume well), and presence tracked via short-TTL keys in Redis refreshed by a heartbeat — if the heartbeat stops, the key expires and the user is considered offline automatically.
- **Payment system**: idempotency keys, an append-only ledger table (you never mutate a historical financial record, you only ever add a new entry — this is what makes an audit trail trustworthy), and webhook retries that verify a cryptographic signature before trusting the payload.

### Production story

> In a system design interview debrief, a candidate designed a URL shortener and immediately reached for a distributed, sharded database "for scale," without ever establishing what scale was actually needed. When asked "how many requests per second," the honest answer worked out to well under what a single well-indexed Postgres instance with a Redis cache in front could handle comfortably. The lesson generalizes directly to real production decisions, not just interviews: over-engineering for a scale you don't have yet has a real cost (more moving parts, more failure modes, slower iteration) and that cost is being paid immediately, for a benefit that may never be needed. The skill being tested — in an interview and in an actual job — is matching the architecture's complexity to the _actual_ constraint, not defaulting to the most impressive-sounding one.

### Common mistakes

- Reaching for a specific technology (Kafka, sharding, microservices) reflexively without first establishing whether the actual scale/requirements justify its added complexity.
- Not asking clarifying questions before designing — a URL shortener at 10 requests/second and one at 100,000 requests/second are genuinely different systems.
- Designing only the happy path and never discussing failure modes (what happens when the cache is down, when a write fails halfway through).
- Treating idempotency, retries, and consistency as an afterthought rather than a first-class part of the design for anything involving money or irreversible actions.

### Best practices

- Always clarify scale, consistency needs, and latency budget before committing to specific components.
- State tradeoffs explicitly out loud — "I'm choosing eventual consistency here because X, which means Y could happen, and that's acceptable because Z."
- Identify the single hardest/most-likely-to-bottleneck part of the system and go deep there, rather than spreading equal shallow detail across every component.
- Bring up idempotency, retries, and failure handling proactively for anything payment- or order-related, since interviewers specifically look for this.

### Performance considerations

- The "hardest part" of most system designs is usually the hot read or hot write path — identify it early and be ready to discuss caching, indexing, or sharding specifically for that path, not generically for the whole system.

### Security considerations

- Any system design touching payments or PII should proactively mention encryption at rest/in transit, least-privilege access, and audit logging — these are exactly the details that separate a "works" design from a production-ready one.

### Interview questions — beginner to senior

- **Beginner:** What questions would you ask before designing a URL shortener?
- **Intermediate:** Design a basic rate limiter — what data structure and where would you enforce it?
- **Advanced:** Design a notification system that fans out to email/SMS/push and handles partial failures gracefully.
- **Senior:** Design a payment system end to end — cover idempotency, the ledger's append-only design, webhook verification, and how you'd handle a partial failure mid-transaction.

### Related topics

Idempotency Keys (§02), Microservices (§23), Caching (§13), Message Queues (§21), System Design Patterns chapter.

---

## 25 Testing

The three testing levels exist because each one catches a different class of bug, and none of them alone is sufficient — unit tests are fast but can't catch integration mistakes, while E2E tests catch real bugs but are slow and expensive to run constantly.

\`\`\`js
const request = require("supertest");
const app = require("../app");

describe("POST /users", () => {
  it("creates a user", async () => {
    const res = await request(app)
      .post("/users")
      .send({ email: "test@test.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("test@test.com");
  });
});

// Mocking lets you test the service layer's LOGIC without actually hitting a database —
// this is only possible because of the layered architecture from §00: the service layer
// depends on a repository interface, so a fake repository is a legitimate stand-in
jest.mock("../repositories/userRepository");
test("service calls repository with correct args", async () => {
  userRepository.create.mockResolvedValue({ id: 1 });
  await userService.createUser({ email: "a@b.com" });
  expect(userRepository.create).toHaveBeenCalledWith({ email: "a@b.com" });
});
\`\`\`

**Unit tests** isolate one function/module and mock everything it depends on — fast, precise about _what_ broke, but they can't tell you if two correctly-tested pieces actually work together. **Integration tests** exercise multiple real layers together (often against a real test database) — slower, but they catch the seams unit tests miss. **E2E tests** drive the whole system the way a real user would — the most realistic, but also the slowest and most brittle, so they're usually reserved for critical user flows rather than every edge case. Coverage percentage is a useful smell test (very low coverage is a red flag) but isn't itself the goal — 100% coverage with weak assertions still misses real bugs.

---

## 26 Docker

Docker solves the "it works on my machine" problem by packaging your app together with its exact runtime environment (OS libraries, dependencies, versions) into one portable image — so what runs in your container is guaranteed identical whether it's your laptop, a teammate's machine, or production.

\`\`\`dockerfile
# Multi-stage build — the build stage has all the tools needed to compile/build
# (which can be large), but the final image only copies over the finished output,
# so the shipped production image doesn't carry around build tools it'll never need again
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
\`\`\`

\`\`\`yaml
# docker-compose.yml — defines a whole multi-container setup (app + its dependencies)
# as one file, so \`docker compose up\` gives every developer the identical local stack
services:
  api:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, redis]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes: ["pgdata:/var/lib/postgresql/data"]
  redis:
    image: redis:7
volumes:
  pgdata:
\`\`\`

An **image** is the immutable blueprint; a **container** is a running instance of it — you can start many containers from the same image. **Volumes** exist because a container's own filesystem is wiped when the container is removed — anything you actually need to persist (like a database's data) has to live in a volume mounted from outside the container's lifecycle.

---

## 27 Kubernetes

Kubernetes exists for the problem Docker alone doesn't solve: once you have dozens or hundreds of containers across many machines, you need something to decide _where_ they run, restart them when they crash, scale them up under load, and route traffic to healthy ones — doing that by hand doesn't work past a certain scale.

| Object                 | What it's actually for                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pod**                | The smallest thing Kubernetes schedules — usually one container, sometimes a couple of tightly-coupled ones that need to share network/storage                                                                                        |
| **Deployment**         | Keeps a target number of pod replicas running, and manages rolling out new versions without downtime (and rolling back if something's wrong)                                                                                          |
| **Service**            | A stable network address for a _set_ of pods — since individual pods come and go (crash, redeploy), you need something whose address doesn't change even as the actual pods behind it do                                              |
| **Ingress**            | Routes external HTTP(S) traffic into the cluster based on rules (hostnames, paths)                                                                                                                                                    |
| **ConfigMap / Secret** | Externalize configuration/sensitive values from the container image itself, so the same image can run in dev/staging/prod just by swapping what's injected                                                                            |
| **HPA**                | Automatically adds/removes pod replicas based on real load (CPU, memory, or a custom metric) — the horizontal scaling idea from §00, automated                                                                                        |
| **StatefulSet**        | Like a Deployment, but for workloads that need a stable identity and stable storage across restarts (databases) — a plain Deployment's pods are interchangeable and disposable, which doesn't work for something like a database node |
| **Job / CronJob**      | For work that's meant to run to completion or on a schedule, rather than run forever like a web server                                                                                                                                |

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: myrepo/api:latest
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: "250m", memory: "256Mi" } # what it's guaranteed to get
            limits: { cpu: "500m", memory: "512Mi" } # the ceiling it can't exceed
\`\`\`

---

## 28 CI/CD

The point of CI/CD is to remove humans from repetitive, error-prone steps (running tests, building, deploying) and to catch problems _before_ they reach production, automatically, on every single change — instead of relying on someone remembering to run the test suite before merging.

\`\`\`yaml
name: CI/CD
on: { push: { branches: [main] } }
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy
        run: ./deploy.sh
\`\`\`

**Blue-green vs canary** are two different answers to "how do I deploy without risking downtime." Blue-green keeps two complete environments running and switches all traffic from the old one to the new one instantly — the appeal is that rollback is just switching back, immediately. Canary instead sends a small slice of real traffic to the new version first, watches for problems, and only then gradually increases that slice — the appeal is catching a bad deploy while it's only affecting a small fraction of users, rather than everyone at once.

---

## 29 AWS

Rather than memorizing a service list, it helps to group AWS services by the actual problem each one removes from your plate:

- **Compute**: EC2 gives you a raw virtual machine you fully manage; Lambda goes the opposite direction — you just supply a function, and AWS handles provisioning, scaling, and you only pay per invocation. ECS/EKS sit in between — managed container orchestration (ECS is AWS's own system, EKS is managed Kubernetes) for when you want containers without running your own cluster control plane.
- **Storage**: S3 is durable object storage for files/backups/static assets — not a database, but often used alongside one. RDS is a managed relational database (Postgres/MySQL) where AWS handles backups, patching, and failover for you.
- **Networking/delivery**: CloudFront is a CDN — it caches your content at edge locations physically close to users, cutting latency for anyone far from your actual server region. API Gateway is a managed front door for your APIs, commonly used to front Lambda functions.
- **Messaging**: SNS is pub/sub — one message fans out to many subscribers. SQS is a managed queue for point-to-point work distribution (see §21 for why queues exist at all).
- **Operations**: CloudWatch is your logs/metrics/alarms system on AWS. IAM is the permissions layer controlling exactly what any given user, service, or role is allowed to touch — misconfigured IAM is one of the most common real-world cloud security incidents.

\`\`\`js
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // ... business logic
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
\`\`\`

---

## 30 Observability

Observability is what lets you answer "why is this broken" _without already knowing the answer in advance_ — it's the difference between a system you can only debug by guessing, and one where the data to diagnose almost anything is already being collected.

The three pillars each answer a different question, which is why you generally need all three, not just one:

- **Logs** answer "what exactly happened, in detail, at this one point in time" — the most granular, but the least structured for spotting trends.
- **Metrics** answer "how is the system behaving over time" — error rate, latency, throughput — good for noticing _that_ something's wrong and roughly when it started, but not _why_.
- **Traces** answer "where, across multiple services, did this one specific request spend its time" — essential in a microservices world where a slow response might be caused by any one of five downstream calls, and you need to see which one.

\`\`\`js
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] });
sdk.start();
\`\`\`

**Liveness vs readiness health checks** solve different problems: liveness (\`/health\`) asks "is this process alive at all, or should it be restarted" — readiness (\`/ready\`) asks "is this instance actually able to serve traffic right now" (e.g., can it reach its database) — a process can be alive but not ready, and routing traffic to it anyway would just produce errors.

---

## 31 Architecture

Each of these patterns is really an answer to "where should business logic live, and what should it be allowed to depend on" — the specific names matter less than the underlying goal: keep the core logic isolated from things that change for unrelated reasons (which database you use, which framework you're on).

**MVC** splits concerns into Model (data), View (presentation), Controller (request handling) — the original separation-of-concerns pattern, still the mental model behind most simple CRUD apps.

**Hexagonal / Ports & Adapters** and **Clean Architecture** both push the same idea further: your core business logic shouldn't depend on any specific framework or database at all — it defines interfaces ("ports") that outside things (a specific database, a specific web framework) implement ("adapters"). The payoff is that swapping your database, or even your web framework, becomes a change at the edges, not a rewrite of your actual business rules.

**DDD (Domain-Driven Design)** is less about a specific code structure and more about a discipline: model your code around the language and concepts your actual business/domain uses, and draw clear boundaries ("bounded contexts") around different subdomains so a term like "Order" doesn't quietly mean five different things in five different parts of the codebase.

**CQRS** separates the model used for writes (commands) from the model used for reads (queries) — worth reaching for when your read and write patterns are genuinely very different (e.g., writes are simple but reads need a heavily denormalized, fast-to-query shape) — trying to serve both from one model can force awkward compromises on both sides.

**Event-driven architecture** has services react to _events_ rather than call each other directly — the producer of an event doesn't need to know who's listening or what they'll do about it, which is what allows services to be added or changed independently over time, at the cost of it being harder to trace the full flow of "what happens when X occurs" just by reading code.

---

## 32 Interview Questions

Short, interview-ready answers — but each is worth being able to _explain_, not just recite, since a good interviewer will ask "why" as a follow-up.

1. **Explain the Event Loop.** It processes fixed phases (timers → pending callbacks → poll → check → close) one at a time, but microtasks (\`process.nextTick\`, resolved Promises) aren't one of those phases — they drain completely between every phase transition and after every callback, with \`nextTick\` always draining first. See §03 for the full example.
2. **What is libuv?** The C library beneath Node that provides the event loop itself and a background thread pool for operations the OS can't do non-blocking (file I/O, DNS).
3. **Streams vs Buffers?** A Buffer holds an entire chunk of binary data in memory at once; a Stream processes data incrementally in small chunks, which is why streams keep memory usage flat even for very large files.
4. **JWT vs Session?** Session auth is stateful (server tracks it, trivially revocable, needs a shared store across servers); JWT is stateless (self-verifying via signature, scales horizontally with no lookup, but hard to revoke early — mitigated with short expiry + refresh tokens).
5. **PUT vs PATCH?** PUT replaces the entire resource and is idempotent (send it twice, same end state); PATCH applies a partial update and is only idempotent if you design it that way (\`set\` is, \`increment\` isn't).
6. **Redis vs Memcached?** Redis supports richer data structures (lists, sets, sorted sets), persistence, and pub/sub; Memcached is simpler and purely key-value, but multi-threaded out of the box.
7. **Kafka vs RabbitMQ?** Kafka is an append-only, replayable log built for high-throughput streaming with multiple independent consumers; RabbitMQ offers more flexible routing and classic "consume once and it's gone" task-queue semantics.
8. **Cluster vs Worker Threads?** Cluster forks separate processes (own memory each) to use multiple cores for I/O-bound work; Worker Threads share memory within one process and are for offloading genuinely CPU-bound work off the main thread.
9. **Why connection pooling?** Opening a DB connection costs a real handshake (and often auth) every time — a pool reuses a fixed set of already-open connections instead of paying that cost per request.
10. **CAP Theorem?** You can't have Consistency, Availability, and Partition tolerance all at once in a distributed system — and since partitions are basically inevitable, the real day-to-day tradeoff is consistency vs availability _during_ a partition.
11. **Circuit Breaker?** Detects that a dependency is consistently failing and stops calling it for a cooldown period, failing fast instead of piling on load to something already struggling — then cautiously tests recovery before reconnecting fully.
12. **Horizontal scaling — what does it require?** The app has to be stateless (or externalize its state to something shared, like Redis), otherwise a given user has to stick to one specific instance, defeating the purpose.
13. **Why did HTTP move from 1.1 to 2 to 3?** 1.1 had head-of-line blocking at the application layer; 2 fixed that with multiplexing but still had TCP's transport-layer HOL blocking; 3 replaced TCP with QUIC/UDP to fix blocking at the transport layer too and speed up handshakes on flaky networks. Full breakdown in §01.
14. **Does MongoDB support transactions?** Yes, multi-document ACID transactions since v4.0 (2018) — "no transactions" is an outdated assumption, and shouldn't be the deciding factor between SQL and Mongo anymore (see the corrected decision tree below).
15. **What's an idempotency key, and why do payment APIs need one?** A client-generated unique ID per logical operation, checked server-side (typically Redis) before executing — retries return the original cached result instead of re-executing, which is exactly what prevents a network retry from double-charging a customer. Full pattern in §02.

---

## 33 Project Structure

**Small project** — grouped by _technical layer_, which is fine while the codebase is small enough that "where's the auth logic" is easy to answer by scanning a handful of folders:

\`\`\`
src/
├── controllers/
├── routes/
├── services/
├── middlewares/
├── models/
├── utils/
├── config/
└── validators/
\`\`\`

**Enterprise / feature-based** — grouped by _business capability_ instead. The reasoning: as a codebase grows, "everything auth-related" scattered across \`controllers/\`, \`services/\`, \`routes/\` etc. becomes harder to navigate than having one \`auth/\` folder containing its own controller, service, and routes together. This also happens to be a natural stepping stone toward microservices later, since each module is already reasonably self-contained.

\`\`\`
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   └── orders/
├── shared/
├── config/
├── database/
├── jobs/
├── events/
└── common/
\`\`\`

---

## 34 Best Practices

These principles aren't rules to follow blindly — each one is a guard against a specific failure mode you've probably already experienced without naming it.

**SOLID** — mainly guards against code that's technically working but painful to change; e.g., Single Responsibility means a class/function changes for exactly one reason, so a change to how you send emails doesn't also risk breaking how you validate user input, just because they were tangled together in the same function.

**DRY** exists because duplicated logic drifts — you fix a bug in one copy and forget the other three exist, and now you have three different behaviors where you meant to have one.

**YAGNI** is a direct counter to over-engineering: building flexibility for a requirement that doesn't exist yet usually guesses wrong about what that future requirement will actually look like, and just adds complexity you have to maintain in the meantime for no real benefit.

**12-Factor App** principles (config in environment variables, stateless processes, logs treated as event streams, dev/prod parity) are really all pointed at the same goal: making an app that's trivially portable and scalable across environments, because none of its identity is baked into one specific machine or one specific config file checked into git.

---

## Bonus Sections

### Complete Request Lifecycle

\`\`\`
Browser
  │
  ▼
DNS Lookup
  │
  ▼
TCP Handshake
  │
  ▼
TLS Handshake (HTTPS)
  │
  ▼
HTTP Request  (HTTP/1.1, /2, or /3 — see §01 for why the version genuinely changes behavior here)
  │
  ▼
Load Balancer
  │
  ▼
Reverse Proxy (Nginx)
  │
  ▼
Express Server
  │
  ▼
Middleware
  │
  ▼
Authentication
  │
  ▼
Validation
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Repository
  │
  ▼
Database / Cache
  │
  ▼
Response
\`\`\`

### Backend Decision Tree

\`\`\`
Need Real-Time?
│
├── Yes
│   ├── Few users → WebSockets
│   ├── Massive scale → Kafka + WebSockets
│   └── Notifications only → SSE (server pushes updates over a single long-lived HTTP
│                                  connection — simpler than WebSockets when you only
│                                  need one-way server-to-client updates)
│
└── No
    └── REST API
\`\`\`

### Database Selection — corrected, with the reasoning

The original version of this tree asked **"Need Transactions? → Yes → PostgreSQL / No → MongoDB,"** and the problem with that isn't just a factual gap — it teaches the wrong mental model for choosing a database. It implies transactions are a SQL-exclusive feature, which hasn't been true since MongoDB added multi-document ACID transactions in **v4.0 (2018)**. The actual decision should be about your data's _shape_ and _write pattern_, not about a feature both databases now have.

\`\`\`
Relational Data & Strict Schema?
   (your data has well-defined relationships, foreign keys genuinely matter,
    and you'll be running complex JOINs/reporting queries across them)
│
├── Yes → PostgreSQL
│         (strong consistency, real JOINs, and JSONB available for the few fields
│          that do need flexibility — see §07)
│
└── No
    │
    Polymorphic / Unstructured Data & High Write Throughput?
       (documents vary in shape between records, the schema evolves often,
        and you need to scale writes horizontally via sharding)
    │
    ├── Yes → MongoDB
    │         (flexible schema, horizontal scaling via sharding, and ACID
    │          transactions are available here too if you need them — see §08)
    │
    ├── Mainly need a fast, ephemeral cache layer? → Redis
    │
    ├── Mainly need full-text / relevance search? → Elasticsearch
    │
    └── Mainly need analytics / OLAP at scale? → ClickHouse
\`\`\`

**The line worth saying out loud in an interview:** "Transactions alone shouldn't be the deciding factor between SQL and NoSQL anymore — MongoDB has had them since 2018. The real question is whether the data is relational and schema-strict, or polymorphic and write-heavy."

### Authentication Flow

\`\`\`
User Login
    │
    ▼
Validate Credentials
    │
    ▼
Generate Access Token (short-lived — limits damage if it's ever stolen)
    │
    ▼
Generate Refresh Token (long-lived — its only job is minting new access tokens)
    │
    ▼
Store Refresh Token (DB/Redis, usually hashed — so even a DB leak doesn't hand out usable tokens)
    │
    ▼
Client Sends Access Token (Authorization header, on every request)
    │
    ▼
Middleware Verifies Token (just checks the signature — no DB lookup needed, which is the whole point of JWT)
    │
    ▼
Protected Route
\`\`\`

### Caching Strategy

\`\`\`
Request
    │
    ▼
  Redis
 ┌──┴──┐
 │ Hit │──────────► Return Data (fast path — database never touched)
 └──┬──┘
   Miss
    │
    ▼
 Database (slow path — only happens when the cache doesn't have it yet)
    │
    ▼
 Store in Redis (so the NEXT request for the same thing takes the fast path)
    │
    ▼
 Return Response
\`\`\`

### Scaling Strategy — roughly in the order you'd actually reach for them

\`\`\`
High Traffic
│
├── Optimize Queries        (cheapest fix, usually the highest leverage — do this first)
├── Add Indexes
├── Add Cache
├── Load Balancer
├── Multiple Servers        (only works cleanly once the app is stateless — see §00)
├── Queue Heavy Tasks       (move slow work out of the request/response cycle — see §20)
├── CDN                     (offload static content delivery entirely)
└── Database Replicas       (scale reads once the database itself becomes the bottleneck)
\`\`\`

### Idempotency in the Request Lifecycle (payments/queues — see §02, §21, §24)

\`\`\`
Client generates Idempotency-Key (UUID)
    │
    ▼
POST /payments/charge  (header: Idempotency-Key)
    │
    ▼
Middleware checks Redis for key
    │
 ┌──┴───────────────┐
 │ Key exists        │ Key new
 │ (seen before)      │
 ▼                    ▼
Return cached      Lock key (SET NX + TTL) — guards against a
response instantly  concurrent duplicate arriving at the same time
(no re-execution)         │
                           ▼
                    Run business logic
                    (charge card, etc.)
                         │
                         ▼
                    Store result in Redis
                    (24h TTL — so even a LATE retry gets the
                     original outcome, not a second charge)
                         │
                         ▼
                    Return response
\`\`\`

---

_Built iteratively — extend any section with deeper drilling or more code samples as you revise._
`
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
