#!/bin/bash
gulp
scp -r dist/* root@thoster.net:/root/server-setup/www/wordpress/adventex
