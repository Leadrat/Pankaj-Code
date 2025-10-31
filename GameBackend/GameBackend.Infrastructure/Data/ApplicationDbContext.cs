using GameBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameBackend.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Score> Scores { get; set; }
    public DbSet<Match> Matches { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
        });

        // Score configuration
        modelBuilder.Entity<Score>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithOne(u => u.Score)
                  .HasForeignKey<Score>(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Match configuration
        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Player1)
                  .WithMany(u => u.MatchesAsPlayer1)
                  .HasForeignKey(e => e.Player1Id)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Player2)
                  .WithMany(u => u.MatchesAsPlayer2)
                  .HasForeignKey(e => e.Player2Id)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed default admin user
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@game.com",
                PasswordHash = "AQAAAAEAACcQAAAAEKqgkTvtFvYFGj2ZKSqEZGqaW7QZWsYFjyUK9GHmNGj8=", // Admin123!
                Role = "Admin",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        );

        // Seed default score for admin
        modelBuilder.Entity<Score>().HasData(
            new Score
            {
                Id = 1,
                UserId = 1,
                Wins = 0,
                Losses = 0,
                Draws = 0,
                TotalScore = 0,
                CreatedAt = DateTime.UtcNow
            }
        );
    }
}
