namespace ReWear.Dtos.Request.InventoryItem;

public class ChangeSizeRequestDto
{
    public Guid InventoryItemId { get; set; }

    public string? TopSize { get; set; }
    public string? BottomWaistSize { get; set; }
    public string? BottomLengthSize { get; set; }
    public string? ShoeSize { get; set; }
}
