export async function GET() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2")
    const countries = await response.json()

    const formattedCountries = countries
      .filter((country: any) => country.idd?.root && country.idd?.suffixes)
      .map((country: any) => ({
        name: country.name.common,
        code: country.cca2,
        flag: country.flag,
        dialCode: `${country.idd.root}${country.idd.suffixes[0] || ""}`,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))

    return Response.json(formattedCountries)
  } catch (error) {
    return Response.json({ error: "Failed to fetch countries" }, { status: 500 })
  }
}
