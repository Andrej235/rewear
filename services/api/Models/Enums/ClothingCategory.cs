namespace ReWear.Models.Enums;

public enum ClothingCategory
{
    None = 0,
    Top = 1 << 0,
    Bottom = 1 << 1,
    Footwear = 1 << 2,
    Outerwear = 1 << 3,
}
