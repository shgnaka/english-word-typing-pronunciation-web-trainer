import { useEffect, useState } from "react";
import {
  defaultProfileName,
  defaultStorageScopeId,
  loadCurrentProfileId,
  loadProfiles,
  saveCurrentProfileId,
  saveProfiles,
  type StoredProfile
} from "../../infra/storage";

function createProfileId(): string {
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `profile-${Date.now().toString(36)}-${randomSuffix}`;
}

function buildDefaultProfile(): StoredProfile {
  return {
    id: defaultStorageScopeId,
    name: defaultProfileName,
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z"
  };
}

export function useProfileManager() {
  const [profiles, setProfiles] = useState<StoredProfile[]>(() => {
    const loadedProfiles = loadProfiles();
    return loadedProfiles.length > 0 ? loadedProfiles : [buildDefaultProfile()];
  });
  const [currentProfileId, setCurrentProfileId] = useState(() => loadCurrentProfileId());

  useEffect(() => {
    if (profiles.some((profile) => profile.id === currentProfileId)) {
      return;
    }

    const resolvedCurrentProfileId = profiles[0]?.id ?? defaultStorageScopeId;
    setCurrentProfileId(resolvedCurrentProfileId);
    saveCurrentProfileId(resolvedCurrentProfileId);
  }, [currentProfileId, profiles]);

  function selectProfile(profileId: string) {
    if (!profiles.some((profile) => profile.id === profileId)) {
      return;
    }

    setCurrentProfileId(profileId);
    saveCurrentProfileId(profileId);
  }

  function createProfile() {
    const now = new Date().toISOString();
    const nextProfile: StoredProfile = {
      id: createProfileId(),
      name: `Profile ${profiles.length + 1}`,
      createdAt: now,
      updatedAt: now
    };
    const nextProfiles = [...profiles, nextProfile];

    setProfiles(nextProfiles);
    setCurrentProfileId(nextProfile.id);
    saveProfiles(nextProfiles);
    saveCurrentProfileId(nextProfile.id);
  }

  function renameProfile(profileId: string, name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const targetProfile = profiles.find((profile) => profile.id === profileId);
    if (!targetProfile || targetProfile.name === trimmedName) {
      return;
    }

    const updatedAt = new Date().toISOString();

    const nextProfiles = profiles.map((profile) =>
      profile.id === profileId
        ? { ...profile, name: trimmedName, updatedAt }
        : profile
    );

    setProfiles(nextProfiles);
    saveProfiles(nextProfiles);
  }

  function deleteProfile(profileId: string) {
    if (profiles.length <= 1) {
      return;
    }

    const nextProfiles = profiles.filter((profile) => profile.id !== profileId);
    if (nextProfiles.length === profiles.length) {
      return;
    }

    const nextCurrentProfileId = currentProfileId === profileId
      ? nextProfiles[0]?.id ?? defaultStorageScopeId
      : currentProfileId;

    setProfiles(nextProfiles.length > 0 ? nextProfiles : [buildDefaultProfile()]);
    saveProfiles(nextProfiles.length > 0 ? nextProfiles : [buildDefaultProfile()]);

    if (nextCurrentProfileId !== currentProfileId) {
      setCurrentProfileId(nextCurrentProfileId);
      saveCurrentProfileId(nextCurrentProfileId);
    }
  }

  return {
    profiles,
    currentProfileId,
    currentProfile: profiles.find((profile) => profile.id === currentProfileId) ?? profiles[0] ?? buildDefaultProfile(),
    selectProfile,
    createProfile,
    renameProfile,
    deleteProfile
  };
}

export type ProfileManagerState = ReturnType<typeof useProfileManager>;
