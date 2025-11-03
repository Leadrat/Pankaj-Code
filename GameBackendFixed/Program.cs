var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowAll");

// Simple auth endpoints
app.MapPost("/api/auth/login", (LoginRequest request) => {
    if (request.Username == "admin" && request.Password == "Admin123!")
    {
        return Results.Ok(new { 
            token = "dummy-jwt-token-for-testing",
            user = new { id = 1, username = "admin", email = "admin@game.com", role = "Admin" }
        });
    }
    return Results.Unauthorized();
});

app.MapPost("/api/auth/register", (RegisterRequest request) => {
    return Results.Ok(new { 
        token = "dummy-jwt-token-for-testing",
        user = new { id = 2, username = request.Username, email = request.Email, role = "User" }
    });
});

// Logout endpoint
app.MapPost("/api/auth/logout", () => {
    return Results.Ok();
});

// Admin endpoints
app.MapGet("/api/admin/users", () => {
    var users = new[] {
        new { id = 1, username = "admin", email = "admin@game.com", role = "Admin", createdAt = DateTime.UtcNow.AddDays(-30), isActive = true, totalScore = 100, wins = 10, losses = 2, draws = 1 },
        new { id = 2, username = "player1", email = "player1@game.com", role = "User", createdAt = DateTime.UtcNow.AddDays(-7), isActive = true, totalScore = 50, wins = 5, losses = 5, draws = 3 }
    };
    return Results.Ok(users);
});

app.MapGet("/api/admin/summary", () => {
    return Results.Ok(new {
        totalUsers = 2,
        activeUsers = 2,
        totalMatches = 22,
        completedMatches = 20,
        totalScore = 150,
        averageScore = 75.0
    });
});

// Keep the original weather endpoint for testing
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

record LoginRequest(string Username, string Password);
record RegisterRequest(string Username, string Email, string Password);
