namespace ReWear.Dtos.Request.DeliveryBox;

public class ChangeBoxItemSizeRequestDto
{
    public Guid InventoryItemId { get; set; }
    public string NewSize { get; set; } = null!;
}
