files=(CommunicationsView.vue LocationView.vue SensorsView.vue TrackingView.vue EncoderView.vue DecoderView.vue ConfigurationView.vue LogsView.vue)

for f in *.vue
do
  echo "<template>$f</template>" > $f
done