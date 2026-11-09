{{- define "public-site.name" -}}
{{- .Values.app.name | default .Chart.Name -}}
{{- end -}}

{{- define "public-site.serviceName" -}}
{{- .Values.service.name | default (printf "%s-svc" (include "public-site.name" .)) -}}
{{- end -}}

{{- define "public-site.selectorLabels" -}}
name: {{ include "public-site.serviceName" . }}
service: {{ include "public-site.serviceName" . }}
{{- end -}}

{{- define "public-site.commonAnnotations" -}}
{{- if .Values.app.downscaler.enabled }}
downscaler/uptime: {{ .Values.app.downscaler.uptime | quote }}
{{- end }}
{{- end -}}