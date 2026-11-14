from django.db import models


class Incidencia(models.Model):
    """Una incidencia registrada en el laboratorio."""

    CATEGORIAS = [
        ('hardware', 'Hardware'),
        ('software', 'Software'),
        ('red', 'Red / Internet'),
    ]

    PRIORIDADES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En proceso'),
        ('resuelto', 'Resuelto'),
    ]

    titulo = models.CharField('título', max_length=120)
    descripcion = models.TextField('descripción')
    categoria = models.CharField(
        max_length=20, choices=CATEGORIAS, default='hardware'
    )
    prioridad = models.CharField(
        max_length=10, choices=PRIORIDADES, default='media'
    )
    estado = models.CharField(
        max_length=20, choices=ESTADOS, default='pendiente'
    )
    creado_en = models.DateTimeField('creado en', auto_now_add=True)

    class Meta:
        ordering = ['-creado_en']
        verbose_name = 'incidencia'
        verbose_name_plural = 'incidencias'

    def __str__(self):
        return self.titulo
