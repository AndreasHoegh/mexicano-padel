// padel-americano/services/authService.ts
export async function completeTournament(token: string): Promise<any> {
  // Increment user's tournament count.
  const incrementResponse = await fetch(
    "https://jwtauthdotnet920250211104511.azurewebsites.net/api/auth/increment-tournaments",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!incrementResponse.ok) {
    throw new Error("Failed to increment tournaments played");
  }
  // Fetch the updated user profile.
  const profileResponse = await fetch(
    "https://jwtauthdotnet920250211104511.azurewebsites.net/api/auth/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!profileResponse.ok) {
    throw new Error("Failed to fetch updated profile");
  }
  const userData = await profileResponse.json();
  return userData;
}
