from rest_framework import serializers

from .models import Incidencia


class IncidenciaSerializer(serializers.ModelSerializer):
    """Convierte Incidencia a JSON y valida los datos de entrada."""

    categoria_display = serializers.CharField(
        source='get_categoria_display', read_only=True
    )
    prioridad_display = serializers.CharField(
        source='get_prioridad_display', read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display', read_only=True
    )

    class Meta:
        model = Incidencia
        fields = '__all__'
        read_only_fields = ['id', 'creado_en']
