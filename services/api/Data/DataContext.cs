using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ReWear.Models;

namespace ReWear.Data;

public class DataContext(DbContextOptions<DataContext> options) : IdentityDbContext<User>(options)
{
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<RefreshToken>(refreshToken =>
        {
            refreshToken.HasKey(x => x.Id);

            refreshToken
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            refreshToken.HasIndex(x => x.Token).IsUnique();

            refreshToken.HasIndex(x => new { x.UserId, x.Token });
        });

        base.OnModelCreating(builder);
        //Add fluent api after the base call to override any defaults but keep identity config
    }
}
