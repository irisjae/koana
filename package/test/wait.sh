time_now=0
while true; do
    sudo lsof -i:7474 && break
    sleep 10
    time_now=$((time_now+10))
    echo "waited $time_now seconds"
done

sleep 10