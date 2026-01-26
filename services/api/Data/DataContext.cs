using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ReWear.Models;

namespace ReWear.Data;

public class DataContext(DbContextOptions<DataContext> options) : IdentityDbContext<User>(options)
{
    public DbSet<ClothingItem> ClothingItems { get; set; }
    public DbSet<ClothingItemEmbedding> ClothingItemEmbeddings { get; set; }
    public DbSet<DeliveryBox> DeliveryBoxes { get; set; }
    public DbSet<DeliveryBoxItem> DeliveryBoxItems { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<UserSize> UserSizes { get; set; }
    public DbSet<UserStyleEmbedding> UserStyleEmbeddings { get; set; }
    public DbSet<UserSubscription> UserSubscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasPostgresExtension("vector");

        builder.Entity<ClothingItem>(clothingItem =>
        {
            clothingItem.HasKey(x => x.Id);
            clothingItem.HasIndex(x => x.Name);
        });

        builder.Entity<ClothingItemEmbedding>(embedding =>
        {
            embedding.HasKey(x => x.ClothingItemId);

            embedding.Property(x => x.Embedding).HasColumnType("vector(1536)").IsRequired();
            embedding
                .HasIndex(x => x.Embedding)
                .HasMethod("hnsw")
                .HasOperators("vector_cosine_ops");

            embedding
                .HasOne(x => x.ClothingItem)
                .WithOne(x => x.Embedding)
                .HasForeignKey<ClothingItemEmbedding>(x => x.ClothingItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DeliveryBox>(box =>
        {
            box.HasKey(x => x.Id);
            box.HasIndex(x => x.UserId);

            box.HasOne(x => x.User)
                .WithMany(x => x.DeliveryBoxes)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DeliveryBoxItem>(boxItem =>
        {
            boxItem.HasKey(x => new { x.DeliveryBoxId, x.InventoryItemId });
            boxItem.HasIndex(x => new { x.DeliveryBoxId, x.InventoryItemId });

            boxItem
                .HasOne(x => x.DeliveryBox)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.DeliveryBoxId)
                .OnDelete(DeleteBehavior.Cascade);

            boxItem
                .HasOne(x => x.InventoryItem)
                .WithMany()
                .HasForeignKey(x => x.InventoryItemId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<InventoryItem>(inventoryItem =>
        {
            inventoryItem.HasKey(x => x.Id);
            inventoryItem.HasIndex(x => x.ClothingItemId);

            inventoryItem
                .HasOne(x => x.ClothingItem)
                .WithMany(x => x.InInventory)
                .HasForeignKey(x => x.ClothingItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

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

        builder.Entity<SubscriptionPlan>(plan =>
        {
            plan.HasKey(x => x.Id);
            plan.HasIndex(x => x.Name).IsUnique();
        });

        builder.Entity<UserSize>(userSize =>
        {
            userSize.HasKey(x => x.Id);

            userSize
                .HasOne<User>()
                .WithMany(x => x.Sizes)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserStyleEmbedding>(styleEmbedding =>
        {
            styleEmbedding.HasKey(x => x.UserId);

            styleEmbedding.Property(x => x.Embedding).HasColumnType("vector(1536)").IsRequired();
            styleEmbedding
                .HasIndex(x => x.Embedding)
                .HasMethod("hnsw")
                .HasOperators("vector_cosine_ops");

            styleEmbedding
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserSubscription>(subscription =>
        {
            subscription.HasKey(x => new { x.UserId, x.SubscriptionPlanId });
            subscription.HasIndex(x => new { x.UserId, x.SubscriptionPlanId });

            subscription
                .HasOne<User>()
                .WithMany(x => x.Subscriptions)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            subscription
                .HasOne<SubscriptionPlan>()
                .WithMany(x => x.Subscriptions)
                .HasForeignKey(x => x.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
