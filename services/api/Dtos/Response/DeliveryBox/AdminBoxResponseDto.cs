namespace ReWear.Dtos.Response.DeliveryBox;

public class AdminBoxResponseDto : DeliveryBoxPreviewResponseDto
{
    public DateTime? SentAt { get; set; }
    public DateTime? ReturnedAt { get; set; }

    public string Username { get; set; } = null!;
}
