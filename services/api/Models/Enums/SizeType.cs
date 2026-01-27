namespace ReWear.Models.Enums;

public enum SizeType
{
    None = 0,
    Top = 1 << 0,
    BottomWaist = 1 << 1,
    BottomLength = 1 << 2,
    Shoe = 1 << 3,
}
