namespace ReWear.Models.Enums;

public enum InventoryItemCondition
{
    None = 0,
    New = 1 << 0,
    LikeNew = 1 << 1,
    VeryGood = 1 << 2,
    Good = 1 << 3,
    Acceptable = 1 << 4,
    Poor = 1 << 5,
    Damaged = 1 << 6,
}
