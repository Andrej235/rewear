namespace ReWear.Models.Enums;

public enum Style
{
    None = 0,
    Minimal = 1 << 0,
    Streetwear = 1 << 1,
    Casual = 1 << 2,
    Formal = 1 << 3,
    Sporty = 1 << 4,
    Classic = 1 << 5,
    Business = 1 << 6,
};
