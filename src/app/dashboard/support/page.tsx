"use client";

import { useEffect, useState } from "react";
import { listProjects, type StoredProject } from "@/lib/store";
import { useTone } from "@/lib/theme";
import { Card, Field, PrimaryButton, SelectInput, TextArea, TextInput } from "@/components/product-ui";

export default function SupportPage() {
  const t = useTone();
  const [sent, setSent] = useState(false);
  const [project, setProject] = useState("");
  const [body, setBody] = useState("");
  const [projects, setProjects] = useState<StoredProject[]>([]);

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  return (
    <div>
      <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Service Center</h1>
      <p className={`mt-1 mb-8 text-[14px] ${t.muted}`}>
        Chat or open a ticket on any product. We handle vendors — you never get a third-party login.
      </p>
      <Card>
        {sent ? (
          <p className={t.ink}>Ticket received. We’ll reply in this thread.</p>
        ) : (
          <div className="space-y-4">
            <Field label="Project">
              <SelectInput value={project} onChange={(e) => setProject(e.target.value)}>
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Subject">
              <TextInput placeholder="What’s going on?" />
            </Field>
            <Field label="Message">
              <TextArea value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            <PrimaryButton
              disabled={!project || body.trim().length < 8}
              onClick={() => setSent(true)}
            >
              Open ticket
            </PrimaryButton>
          </div>
        )}
      </Card>
    </div>
  );
}
