using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.DeliveryBox;

public partial class FullAdminBoxResponseDto
{
    public Guid Id { get; set; }

    public string Username { get; set; } = null!;
    public DateOnly Month { get; set; }
    public DeliveryBoxStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    public IEnumerable<AdminDeliveryBoxItemResponseDto> Items { get; set; } = [];
    public int MaxItemCount { get; set; }
}
