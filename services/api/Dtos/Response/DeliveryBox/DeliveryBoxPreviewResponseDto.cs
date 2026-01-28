using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.DeliveryBox;

public class DeliveryBoxPreviewResponseDto
{
    public Guid Id { get; set; }
    public DateOnly Month { get; set; }
    public DeliveryBoxStatus Status { get; set; }
    public int ItemCount { get; set; }
}
