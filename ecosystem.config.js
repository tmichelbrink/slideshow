module.exports = {
        apps: [
                {
                        name: 'sync',
                        cwd: '/home/thom/projects/gphotos-sync',
                        script: 'src/main.js',
                        interpreter: '/usr/bin/node',
                        cron_restart: "0 0 * * 0",
                        autorestart: false,
                        merge_logs : true,
                },
		{
                        name: 'swap',
                        cwd: '/home/thom/projects/gphotos-sync',
                        script: 'src/swap.js',
                        interpreter: '/usr/bin/node',
			autorestart: true,
                        merge_logs : true,
                },
		{
                        name: 'slide',
                        cwd: '/home/thom/projects/slideshow',
                        script: 'src/slide.ts',
                        interpreter: '/usr/bin/ts-node',
			autorestart: true,
                        merge_logs : true,
                },
        ]
}                                                                                                                                                                                            
