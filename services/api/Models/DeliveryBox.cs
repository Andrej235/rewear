using ReWear.Models.Enums;

namespace ReWear.Models;

public class DeliveryBox
{
    public Guid Id { get; set; }

    public User User { get; set; } = null!;
    public string UserId { get; set; } = null!;

    public DateOnly Month { get; set; }
    public DeliveryBoxStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    public ICollection<DeliveryBoxItem> Items { get; set; } = [];
}
