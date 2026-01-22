using ReWear.Models.Enums;

namespace ReWear.Models;

public class UserSize
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;

    public string Label { get; set; } = string.Empty;
    public SizeType SizeType { get; set; }
}
