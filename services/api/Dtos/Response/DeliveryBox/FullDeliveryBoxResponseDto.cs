using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.DeliveryBox;

public class FullDeliveryBoxResponseDto
{
    public Guid Id { get; set; }

    public DateOnly Month { get; set; }
    public DeliveryBoxStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    public IEnumerable<DeliveryBoxItemResponseDto> Items { get; set; } = [];
}
