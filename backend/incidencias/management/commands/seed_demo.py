"""Carga las cinco incidencias de prueba obligatorias de la guía.

Uso:
    python manage.py seed_demo
"""
from django.core.management.base import BaseCommand

from incidencias.models import Incidencia

DATOS = [
    {
        'titulo': 'PC no enciende',
        'descripcion': 'El equipo del laboratorio 2 no responde al presionar '
                       'el botón de encendido. Revisar cable de poder y fuente.',
        'categoria': 'hardware',
        'prioridad': 'alta',
        'estado': 'pendiente',
    },
    {
        'titulo': 'Python no abre',
        'descripcion': 'Al ejecutar Python desde la terminal aparece un error '
                       'de entorno. Reinstalar o reparar la instalación.',
        'categoria': 'software',
        'prioridad': 'media',
        'estado': 'en_proceso',
    },
    {
        'titulo': 'Wi-Fi lento',
        'descripcion': 'La conexión inalámbrica del aula presenta latencia '
                       'alta durante las prácticas.',
        'categoria': 'red',
        'prioridad': 'alta',
        'estado': 'pendiente',
    },
    {
        'titulo': 'Teclado defectuoso',
        'descripcion': 'Varias teclas del teclado del equipo 7 no responden. '
                       'Se reemplazó por uno de respaldo.',
        'categoria': 'hardware',
        'prioridad': 'baja',
        'estado': 'resuelto',
    },
    {
        'titulo': 'Navegador desactualizado',
        'descripcion': 'Chrome muestra fallos al abrir el panel de prácticas. '
                       'Se actualizó a la última versión estable.',
        'categoria': 'software',
        'prioridad': 'media',
        'estado': 'resuelto',
    },
]


class Command(BaseCommand):
    help = 'Crea las incidencias de prueba de la guía si la base está vacía.'

    def handle(self, *args, **options):
        creadas = 0
        for datos in DATOS:
            _, creado = Incidencia.objects.get_or_create(
                titulo=datos['titulo'], defaults=datos
            )
            if creado:
                creadas += 1

        total = Incidencia.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'Datos de prueba: {creadas} nueva(s). Total en base: {total}.'
        ))
