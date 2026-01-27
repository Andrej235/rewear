namespace ReWear.Models.Enums;

public enum InventoryItemStatus
{
    None = 0,
    Available = 1 << 0,
    Reserved = 1 << 1,
    InCleaning = 1 << 2,
    Retired = 1 << 3,
}
