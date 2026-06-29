"use client";

import { useState } from "react";
import { EMAIL_PATTERN } from "./constants";

export type SubmitStatus = "idle" | "loading" | "success" | "error";
export type FieldKey = "name" | "email" | "password";

export function useSignupForm(shouldReduceMotion: boolean, forceDisabled = false) {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [fields, setFields] = useState({ name: "", email: "", password: "" });

  const canSubmit =
    !forceDisabled &&
    submitStatus !== "loading" &&
    submitStatus !== "success" &&
    fields.name.trim().length > 1 &&
    EMAIL_PATTERN.test(fields.email) &&
    fields.password.length >= 8;

  function updateField(key: FieldKey, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (submitStatus !== "idle") setSubmitStatus("idle");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("loading");
    window.setTimeout(() => {
      setSubmitStatus("success");
    }, shouldReduceMotion ? 0 : 700);
  }

  function fieldInvalid(key: FieldKey) {
    if (submitStatus !== "error") return false;
    if (key === "name") return fields.name.trim().length <= 1;
    if (key === "email") return !EMAIL_PATTERN.test(fields.email);
    return fields.password.length < 8;
  }

  return {
    submitStatus,
    disabled: forceDisabled,
    fields,
    canSubmit,
    updateField,
    handleSubmit,
    fieldInvalid,
  };
}
