namespace ReWear.Utilities;

public static class EnumExtensions
{
    public static IEnumerable<TEnum> ToFlags<TEnum>(this TEnum value)
        where TEnum : struct, Enum
    {
        foreach (var flag in Enum.GetValues<TEnum>())
        {
            if (value.HasFlag(flag))
                yield return flag;
        }
    }

    public static TEnum FromFlags<TEnum>(this IEnumerable<TEnum> flags)
        where TEnum : struct, Enum
    {
        TEnum result = default!;
        foreach (var flag in flags)
        {
            result = (TEnum)(object)(((int)(object)result) | ((int)(object)flag));
        }
        return result;
    }
}
